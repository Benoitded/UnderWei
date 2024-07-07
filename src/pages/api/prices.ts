import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import tokensData from "../../data/tokens.json";

interface Token {
  name: string;
  ticker: string;
  image_url: string;
  contract: string;
  contract_mainnet: string;
  default_value: number;
}

interface TokenPrice {
  usd: number;
  usd_24h_change: number;
}

interface DexScreenerTokenMap {
  [key: string]: TokenPrice;
}

const stableTokens = ["USDT", "USDC", "DAI"];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const findTokenDataByMainnetAddress = (address: string): Token | null => {
  const data: { [key: string]: Token[] } = tokensData;
  for (const network in data) {
    const tokens = data[network];
    for (const token of tokens) {
      if (token.contract_mainnet.toLowerCase() === address.toLowerCase()) {
        return token;
      }
    }
  }
  return null;
};

async function fetchDexScreenerPrice(
  contractAddresses: string[]
): Promise<DexScreenerTokenMap> {
  console.log("DEXSCREENER price fetching starts");
  const tokenPriceMap: DexScreenerTokenMap = {};

  const pricePromises = contractAddresses.map(async (address) => {
    const tokenData = findTokenDataByMainnetAddress(address);
    if (!tokenData) {
      console.error(`Token data not found for contract: ${address}`);
      return;
    }

    if (stableTokens.includes(tokenData.ticker)) {
      tokenPriceMap[address.toLowerCase()] = {
        usd: 1,
        usd_24h_change: 0,
      };
      return;
    }

    try {
      const url = `https://api.dexscreener.com/latest/dex/tokens/${address}`;
      console.log(url);
      const response = await axios.get(url, { timeout: 3000 });
      await wait(150);

      let usd, usd_24h_change;
      console.log("analyzing token " + address);

      const pairsWithLiquidityAndVolume = response.data.pairs.filter(
        (pair: any) => pair.liquidity.usd > 500 && pair.volume.h24 > 500
      );
      const pairsWithStableWithLiq = pairsWithLiquidityAndVolume.filter(
        (pair: any) => stableTokens.includes(pair.quoteToken.symbol)
      );

      if (pairsWithLiquidityAndVolume.length > 0) {
        if (pairsWithStableWithLiq.length > 0) {
          usd = pairsWithStableWithLiq[0].priceUsd;
          usd_24h_change = pairsWithStableWithLiq[0].priceChange?.h24;
        } else {
          usd = pairsWithLiquidityAndVolume[0].priceUsd;
          usd_24h_change = pairsWithLiquidityAndVolume[0].priceChange?.h24;
        }
      } else {
        console.log("pas trouvé pour " + address);
        usd = 0;
        usd_24h_change = 0;
      }

      tokenPriceMap[address.toLowerCase()] = {
        usd,
        usd_24h_change,
      };
    } catch (error: any) {
      console.error(
        `Erreur lors de la récupération des prix pour le token: ${address}`
      );
      console.error(error.response);
      tokenPriceMap[address.toLowerCase()] = {
        usd: tokenData.default_value,
        usd_24h_change: 0,
      };
    }
  });

  await Promise.all(pricePromises);

  console.log("tokenPrices dexscreener");
  console.log(tokenPriceMap);
  return tokenPriceMap;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { contracts } = req.query;

    if (!contracts) {
      return res
        .status(400)
        .json({ error: "Contracts query parameter is required" });
    }

    const contractAddresses =
      typeof contracts === "string" ? contracts.split(",") : [];

    if (contractAddresses.length === 0) {
      return res
        .status(400)
        .json({ error: "Invalid contracts query parameter" });
    }

    try {
      const prices = await fetchDexScreenerPrice(contractAddresses);
      res.status(200).json(prices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch token prices" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
