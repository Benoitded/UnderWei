import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAccount, useDisconnect, useContractRead } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import styles from "./PendingClaims.module.scss";

import auctionABI from "@/ABI/auction.json";
import addresses from "@/ABI/address.json";
import { holesky, polygonAmoy } from "viem/chains";

const PendingClaims: React.FC = () => {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { open, close } = useWeb3Modal();
  const { disconnect } = useDisconnect();

  const [firstAuctionHolesky, setFirstAuctionHolesky] = useState<any>(null);
  const [firstAuctionAmoy, setFirstAuctionAmoy] = useState<any>(null);

  const chainId = useAccount().chainId;

  // Fetch data for Holesky
  const { data: claimsHolesky } = useContractRead({
    address: addresses.Holesky.AuctionReward as `0x${string}`,
    abi: auctionABI,
    functionName: "getAllAcceptedAuctions",
    chainId: holesky.id,
  });

  // Fetch data for Amoy
  const { data: claimsAmoy } = useContractRead({
    address: addresses.Amoy.AuctionReward as `0x${string}`,
    abi: auctionABI,
    functionName: "getAllAcceptedAuctions",
    chainId: polygonAmoy.id, // replace with actual chainId for Amoy
  });

  useEffect(() => {
    console.log("claimsHolesky ", claimsHolesky);
    console.log("claimsAmoy ", claimsAmoy);
    if (Array.isArray(claimsHolesky) && claimsHolesky.length > 0) {
      setFirstAuctionHolesky(claimsHolesky[0]);
    }
    if (Array.isArray(claimsAmoy) && claimsAmoy.length > 0) {
      setFirstAuctionAmoy(claimsAmoy[0]);
    }
  }, [claimsHolesky, claimsAmoy]);

  return (
    <div className={styles.pendingClaims}>
      <div>
        <h3>Holesky Auctions</h3>
        {firstAuctionHolesky ? (
          <div>
            <p>First Auction:</p>
          </div>
        ) : (
          <p>No auctions found or not connected</p>
        )}
      </div>
      <div>
        <h3>Amoy Auctions</h3>
        {firstAuctionAmoy ? (
          <div>
            <p>First Auction:</p>
            {/* <pre>{JSON.stringify(firstAuctionAmoy, null, 2)}</pre> */}
          </div>
        ) : (
          <p>No auctions found or not connected</p>
        )}
      </div>
    </div>
  );
};

export default PendingClaims;
