import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  useAccount,
  useDisconnect,
  useContractRead,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import styles from "./PendingBridges.module.scss";

import auctionABI from "@/ABI/auction.json";
import addresses from "@/ABI/address.json";
import dataTokens from "@/data/tokens.json";
import dataBlockchains from "@/data/chains.json";
import { Token } from "@/types/generalTypes";
import { holesky, polygonAmoy } from "viem/chains";
import { formatEther } from "viem";
import { parseEther, formatUnits } from "ethers";

interface CreatedAuction {
  auctionOpen: boolean;
  seller: string;
  buyer: string;
  tokenForSale: string;
  tokenForPayment: string;
  amountForSale: number;
  startingPrice: number;
  endPrice: number;
  startAt: number;
  expiresAt: number;
  auctionChainID: number;
  acceptingOfferChainID: number;
  id: number;
}

const PendingBridges: React.FC = () => {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { open, close } = useWeb3Modal();
  const { disconnect } = useDisconnect();

  const [totalAuctions, setTotalAuctions] = useState<CreatedAuction[]>([]);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelledAuctionId, setCancelledAuctionId] = useState<number | null>(
    null
  );

  const chainId = useAccount().chainId;
  const contractAddress =
    chainId === 17000
      ? addresses.Holesky.AuctionReward
      : addresses.Amoy.AuctionReward;

  const { data: auctionsHolesky } = useContractRead({
    address: addresses.Holesky.AuctionReward as `0x${string}`,
    abi: auctionABI,
    functionName: "getAllCreatedAuctions",
    chainId: holesky.id,
  });
  const { data: auctionsAmoy } = useContractRead({
    address: addresses.Amoy.AuctionReward as `0x${string}`,
    abi: auctionABI,
    functionName: "getAllCreatedAuctions",
    chainId: polygonAmoy.id,
  });

  const { writeContract } = useWriteContract();
  const {
    isLoading,
    isSuccess,
    isError,
    data: transactionHash,
  } = useWaitForTransactionReceipt();

  useEffect(() => {
    const combinedAuctions: CreatedAuction[] = [];

    if (Array.isArray(auctionsHolesky)) {
      console.log("auctionsHolesky", auctionsHolesky);
      combinedAuctions.push(
        ...auctionsHolesky.map((auction, index) => ({
          ...auction,
          id: index,
        }))
      );
    }
    if (Array.isArray(auctionsAmoy)) {
      console.log("auctionsAmoy", auctionsAmoy);
      combinedAuctions.push(
        ...auctionsAmoy.map((auction, index) => ({
          ...auction,
          id: index,
        }))
      );
    }
    console.log("totalAuctions: ", combinedAuctions);
    setTotalAuctions(
      combinedAuctions.filter(
        (e) =>
          e.seller.toLowerCase() === address?.toLowerCase() && e.auctionOpen
      )
    );
  }, [auctionsHolesky, auctionsAmoy]);

  function getTokenDetails(contract: string): Token | undefined {
    for (const chain of Object.values(dataTokens)) {
      const token = chain.find(
        (token: Token) =>
          token.contract.toLowerCase() === contract.toLowerCase()
      );
      if (token) {
        return token;
      }
    }
    return undefined;
  }

  function getBlockchainDetails(chainId: number) {
    return dataBlockchains.find(
      (blockchain) => blockchain.chain_id === chainId
    );
  }

  function formatTokenAmount(amount: bigint, decimals: number = 18): string {
    const formatted = parseFloat(formatUnits(amount, decimals));
    if (formatted >= 1) {
      return formatted.toFixed(2); // Show up to 2 decimal places if the amount is 1 or more
    } else {
      return formatted.toFixed(6); // Show up to 6 decimal places if the amount is less than 1
    }
  }

  const handleCancelAuction = async (auction: CreatedAuction) => {
    try {
      setIsCancelling(true);
      setCancelledAuctionId(auction.id);
      const chain_id = Number(auction.auctionChainID);
      const contractAddress =
        chain_id === 17000
          ? addresses.Holesky.AuctionReward
          : addresses.Amoy.AuctionReward;
      console.log(auction);
      console.log(chain_id);
      console.log(auction.id);
      console.log(contractAddress);
      console.log(auction.buyer);
      await writeContract({
        address: contractAddress as `0x${string}`,
        abi: auctionABI,
        functionName: "closeAuction",
        args: [auction.id, auction.buyer],
        chainId: chain_id,
      });
    } catch (error) {
      console.error("Failed to cancel auction:", error);
    } finally {
      setIsCancelling(false);
      setCancelledAuctionId(null);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      setTotalAuctions((prevAuctions) =>
        prevAuctions.filter((auction) => auction.id !== cancelledAuctionId)
      );
      setCancelledAuctionId(null);
    }
  }, [isSuccess]);

  return (
    <div className={styles.pendingBridges}>
      {totalAuctions.length > 0 ? (
        totalAuctions.map((auction, index) => {
          const tokenSource = getTokenDetails(auction.tokenForSale);
          const blockchainSource = getBlockchainDetails(
            Number(auction.auctionChainID)
          );
          const amountForSale = formatTokenAmount(
            BigInt(auction.amountForSale),
            tokenSource?.decimals || 18
          );
          const tokenDest = getTokenDetails(auction.tokenForPayment);
          const blockchainDest = getBlockchainDetails(
            Number(auction.acceptingOfferChainID)
          );
          const amountForPayment = formatTokenAmount(
            BigInt(auction.endPrice),
            tokenDest?.decimals || 18
          );
          return (
            <div key={index} className={styles.auctionLine}>
              <div className={styles.tokensInfo}>
                <div className={styles.tokenInfo}>
                  <div className={styles.divImg}>
                    <img
                      src={tokenSource?.image_url}
                      alt={`Logo of token ${tokenSource?.name}`}
                    />
                    <img
                      src={blockchainSource?.image_url}
                      alt={`Logo of blockchain ${blockchainSource?.name}`}
                      className={styles.blockchainDiv}
                    />
                  </div>
                  <div className={styles.textDiv}>
                    <div>{tokenSource?.ticker}</div>
                    <div>{amountForSale}</div>
                  </div>
                </div>
                <div>→</div>
                <div className={styles.tokenInfo} style={{ opacity: "0.2" }}>
                  <div className={styles.divImg}>
                    <img
                      src={tokenDest?.image_url}
                      alt={`Logo of token ${tokenDest?.name}`}
                    />
                    <img
                      src={blockchainDest?.image_url}
                      alt={`Logo of blockchain ${blockchainDest?.name}`}
                      className={styles.blockchainDiv}
                    />
                  </div>
                  <div className={styles.textDiv}>
                    <div>{tokenDest?.ticker}</div>
                    <div>{amountForPayment}</div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleCancelAuction(auction)}
                disabled={isCancelling && cancelledAuctionId === auction.id}
              >
                {isCancelling && cancelledAuctionId === auction.id
                  ? "Cancelling..."
                  : "Cancel"}
              </button>
            </div>
          );
        })
      ) : (
        <p>No auctions found or not connected</p>
      )}
    </div>
  );
};

export default PendingBridges;
