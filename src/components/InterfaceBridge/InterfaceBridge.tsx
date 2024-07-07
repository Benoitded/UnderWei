import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import ListTokens from "../ListTokens/ListTokens";
import styles from "./InterfaceBridge.module.scss";
import chainsData from "../../data/chains.json";
import tokensData from "../../data/tokens.json"; // Import tokens data

interface TokenData {
  name: string;
  ticker: string;
  contract: string;
  contract_mainnet: string; // Add contract_mainnet to the interface
  chain_id: number;
  image_url: string;
}

const InterfaceBridge: React.FC = () => {
  const { isConnected } = useAccount();
  const { open } = useWeb3Modal();

  const [whatToDisplay, setWhatToDisplay] = useState<
    "inputs" | "tokensSource" | "tokensDest"
  >("inputs");

  const [tokenSource, setTokenSource] = useState<TokenData | null>(null);
  const [tokenDest, setTokenDest] = useState<TokenData | null>(null);
  const [sourceAmount, setSourceAmount] = useState<number>(0);
  const [destAmount, setDestAmount] = useState<number>(0);
  const [prices, setPrices] = useState<{ [key: string]: number }>({});
  const [acceptedRate, setAcceptedRate] = useState<number>(0);
  const [timeFrame, setTimeFrame] = useState<number>(7);

  useEffect(() => {
    if (tokenSource && tokenDest) {
      fetchPrices([tokenSource.contract_mainnet, tokenDest.contract_mainnet]); // Use contract_mainnet
    }
  }, [tokenSource, tokenDest]);

  const fetchPrices = async (contracts: string[]) => {
    try {
      const response = await fetch(
        `/api/prices?contracts=${contracts.join(",")}`
      );
      const data = await response.json();
      const newPrices: { [key: string]: number } = {};
      contracts.forEach((contract) => {
        newPrices[contract] = data[contract.toLowerCase()]?.usd || 0;
      });
      setPrices(newPrices);

      // Update destAmount whenever prices change
      if (
        tokenSource &&
        tokenDest &&
        newPrices[tokenSource.contract_mainnet] &&
        newPrices[tokenDest.contract_mainnet]
      ) {
        const destAmount =
          (sourceAmount * newPrices[tokenSource.contract_mainnet]) /
          newPrices[tokenDest.contract_mainnet];
        setDestAmount(destAmount);
      }
    } catch (error) {
      console.error("Failed to fetch prices:", error);
    }
  };

  const handleSelectTokenSource = (token: TokenData) => {
    setTokenSource(token);
    setWhatToDisplay("inputs");
  };

  const handleSelectTokenDest = (token: TokenData) => {
    setTokenDest(token);
    setWhatToDisplay("inputs");
  };

  const handleClickTokenSource = () => {
    setWhatToDisplay(
      whatToDisplay === "tokensSource" ? "inputs" : "tokensSource"
    );
  };

  const handleClickTokenDest = () => {
    setWhatToDisplay(whatToDisplay === "tokensDest" ? "inputs" : "tokensDest");
  };

  const getChainUrl = (chainId: number) => {
    const chain = chainsData.find((chain) => chain.chain_id === chainId);
    return chain ? chain.image_url : "#";
  };

  const handleSourceAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = parseFloat(e.target.value);
    setSourceAmount(amount);
    if (
      tokenSource &&
      tokenDest &&
      prices[tokenSource.contract_mainnet] &&
      prices[tokenDest.contract_mainnet]
    ) {
      const destAmount =
        (amount * prices[tokenSource.contract_mainnet]) /
        prices[tokenDest.contract_mainnet];
      setDestAmount(destAmount);
    }
  };

  const getStepValue = (amount: number): number => {
    if (amount < 1) return 0.00001;
    if (amount < 10) return 0.001;
    if (amount < 100) return 0.01;
    return 0.1;
  };

  return (
    <div className={styles.interfaceBridge}>
      {whatToDisplay !== "inputs" && (
        <button
          className={styles.backBtn}
          onClick={() => setWhatToDisplay("inputs")}
        >
          back
        </button>
      )}
      <div className={styles.lineTokens}>
        <button className={styles.tokenSource} onClick={handleClickTokenSource}>
          {tokenSource ? (
            <>
              <div className={styles.divImg}>
                <img
                  src={tokenSource.image_url}
                  alt={`${tokenSource.name} logo`}
                />
                <div className={styles.blockchainDiv}>
                  <img
                    src={getChainUrl(tokenSource.chain_id)}
                    alt="Logo of blockchain"
                  />
                </div>
              </div>
              <span>{tokenSource.ticker}</span>
            </>
          ) : (
            "Click to select source token/chain"
          )}
        </button>
        <button className={styles.tokenDest} onClick={handleClickTokenDest}>
          {tokenDest ? (
            <>
              <div className={styles.divImg}>
                <img src={tokenDest.image_url} alt={`${tokenDest.name} logo`} />
                <div className={styles.blockchainDiv}>
                  <img
                    src={getChainUrl(tokenDest.chain_id)}
                    alt="Logo of blockchain"
                  />
                </div>
              </div>
              <span>{tokenDest.ticker}</span>
            </>
          ) : (
            "Click to select destination token/chain"
          )}
        </button>
      </div>
      {whatToDisplay === "inputs" ? (
        <>
          <div className={styles.lineInputSource}>
            {tokenSource ? (
              <>
                <div className={styles.divImg}>
                  <img
                    src={tokenSource.image_url}
                    alt={`${tokenSource.name} logo`}
                  />
                  <div className={styles.blockchainDiv}>
                    <img
                      src={getChainUrl(tokenSource.chain_id)}
                      alt="Logo of blockchain"
                    />
                  </div>
                </div>
                <input
                  type="number"
                  value={sourceAmount}
                  onChange={handleSourceAmountChange}
                />
              </>
            ) : (
              "Input amount source token/chain"
            )}
          </div>
          <div className={styles.lineInputDest}>
            {tokenDest ? (
              <>
                <div className={styles.divImg}>
                  <img
                    src={tokenDest.image_url}
                    alt={`${tokenDest.name} logo`}
                  />
                  <div className={styles.blockchainDiv}>
                    <img
                      src={getChainUrl(tokenDest.chain_id)}
                      alt="Logo of blockchain"
                    />
                  </div>
                </div>
                <input type="number" value={destAmount} readOnly />
              </>
            ) : (
              "Input amount destination token/chain"
            )}
          </div>
          <div className={styles.rangeDiv}>
            <div className={styles.firstLineRange}>
              <div>Lowest accepted rate</div>
              <div>{acceptedRate}</div>
            </div>
            <input
              type="range"
              min="0"
              max={destAmount}
              step={getStepValue(destAmount)}
              onChange={(e) => setAcceptedRate(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
          <div className={styles.rangeDiv}>
            <div className={styles.firstLineRange}>
              <div>Lowest accepted rate</div>
              <div>{timeFrame} days</div>
            </div>
            <input
              type="range"
              min="0"
              max="7"
              step="0.1"
              onChange={(e) => setTimeFrame(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
        </>
      ) : (
        <ListTokens
          onSelectToken={
            whatToDisplay === "tokensSource"
              ? handleSelectTokenSource
              : handleSelectTokenDest
          }
        />
      )}
      {isConnected ? (
        <button className={styles.bridgeButton}>Click to bridge</button>
      ) : (
        <button className={styles.bridgeButton} onClick={() => open()}>
          Connect
        </button>
      )}
    </div>
  );
};

export default InterfaceBridge;
