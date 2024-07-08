// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import {
//   useAccount,
//   useDisconnect,
//   useContractRead,
//   useWriteContract,
//   useWaitForTransactionReceipt,
// } from "wagmi";
// import { useWeb3Modal } from "@web3modal/wagmi/react";
// import styles from "./InterfaceClaim.module.scss";

// import auctionABI from "@/ABI/auction.json";
// import addresses from "@/ABI/address.json";
// import dataTokens from "@/data/tokens.json";
// import dataBlockchains from "@/data/chains.json";
// import { Token } from "@/types/generalTypes";
// import { holesky, polygonAmoy } from "viem/chains";
// import { formatEther } from "viem";
// import { parseEther, formatUnits } from "ethers";
// import toast from "react-hot-toast";

// interface CreatedAuction {
//   auctionOpen: boolean;
//   seller: string;
//   buyer: string;
//   tokenForSale: string;
//   tokenForPayment: string;
//   amountForSale: number;
//   startingPrice: number;
//   endPrice: number;
//   startAt: number;
//   expiresAt: number;
//   auctionChainID: number;
//   acceptingOfferChainID: number;
//   id: number;
// }
// interface ListClaims {
//   acceptOfferTimestamp: number;
//   amountPaying: number;
//   auctionAccepted: boolean;
//   auctionId: number;
//   buyer: string;
//   createdAuctionChainId: number;
//   seller: string;
//   tokenForAccepting: string;
// }

// const InterfaceClaim: React.FC = () => {
//   const router = useRouter();
//   const { isConnected, address } = useAccount();
//   const { open, close } = useWeb3Modal();
//   const { disconnect } = useDisconnect();

//   const [totalAuctions, setTotalAuctions] = useState<CreatedAuction[]>([]);
//   const [totalClaims, setTotalClaims] = useState<ListClaims[]>([]);
//   const [isCancelling, setIsCancelling] = useState(false);
//   const [cancelledAuctionId, setCancelledAuctionId] = useState<number | null>(
//     null
//   );

//   const [firstAuctionHolesky, setFirstAuctionHolesky] = useState<any>(null);
//   const [firstAuctionAmoy, setFirstAuctionAmoy] = useState<any>(null);

//   const chainId = useAccount().chainId;
//   const contractAddress =
//     chainId === 17000
//       ? addresses.Holesky.AuctionReward
//       : addresses.Amoy.AuctionReward;

//   const { data: claimsHolesky } = useContractRead({
//     address: addresses.Holesky.AuctionReward as `0x${string}`,
//     abi: auctionABI,
//     functionName: "getAllAcceptedAuctions",
//     chainId: holesky.id,
//   });

//   // Fetch data for Amoy
//   const { data: claimsAmoy } = useContractRead({
//     address: addresses.Amoy.AuctionReward as `0x${string}`,
//     abi: auctionABI,
//     functionName: "getAllAcceptedAuctions",
//     chainId: polygonAmoy.id, // replace with actual chainId for Amoy
//   });

//   const { data: hash, writeContract } = useWriteContract();
//   const { isLoading, isSuccess, isError } = useWaitForTransactionReceipt({
//     hash,
//     pollingInterval: 500,
//   });

//   useEffect(() => {
//     const combinedClaims: ListClaims[] = [];
//     console.log("claimsAmoy ", claimsAmoy);
//     if (Array.isArray(claimsHolesky) && claimsHolesky.length > 0) {
//       console.log("claimsHolesky ", claimsHolesky);
//       // setFirstAuctionHolesky(claimsHolesky[0]);
//       combinedClaims.push(
//         ...claimsHolesky.map((auction, index) => ({
//           ...auction,
//           id: index,
//         }))
//       );
//     }
//     if (Array.isArray(claimsAmoy) && claimsAmoy.length > 0) {
//       console.log("claimsAmoy ", claimsAmoy);
//       // setFirstAuctionAmoy(claimsAmoy[0]);
//       combinedClaims.push(
//         ...claimsAmoy.map((auction, index) => ({
//           ...auction,
//           id: index,
//         }))
//       );
//     }

//     console.log("totalClaims: ", totalClaims);
//     setTotalClaims(totalClaims.filter((e) => !e.auctionAccepted));
//   }, [claimsHolesky, claimsAmoy]);

//   // useEffect(() => {
//   //   const combinedAuctions: CreatedAuction[] = [];

//   //   if (Array.isArray(auctionsHolesky)) {
//   //     console.log("auctionsHolesky", auctionsHolesky);
//   //     combinedAuctions.push(
//   //       ...auctionsHolesky.map((auction, index) => ({
//   //         ...auction,
//   //         id: index,
//   //       }))
//   //     );
//   //   }
//   //   if (Array.isArray(auctionsAmoy)) {
//   //     console.log("auctionsAmoy", auctionsAmoy);
//   //     combinedAuctions.push(
//   //       ...auctionsAmoy.map((auction, index) => ({
//   //         ...auction,
//   //         id: index,
//   //       }))
//   //     );
//   //   }
//   //   console.log("totalAuctions: ", combinedAuctions);
//   //   setTotalAuctions(combinedAuctions.filter((e) => e.auctionOpen));
//   // }, [auctionsHolesky, auctionsAmoy]);

//   function getTokenDetails(contract: string): Token | undefined {
//     for (const chain of Object.values(dataTokens)) {
//       const token = chain.find(
//         (token: Token) =>
//           token.contract.toLowerCase() === contract.toLowerCase()
//       );
//       if (token) {
//         return token;
//       }
//     }
//     return undefined;
//   }

//   function getBlockchainDetails(chainId: number) {
//     return dataBlockchains.find(
//       (blockchain) => blockchain.chain_id === chainId
//     );
//   }

//   function formatTokenAmount(amount: bigint, decimals: number = 18): string {
//     const formatted = parseFloat(formatUnits(amount, decimals));
//     if (formatted >= 100000000) {
//       return (formatted / 1000000).toFixed(0) + "M";
//     } else if (formatted >= 100000) {
//       return (formatted / 1000).toFixed(0) + "k";
//     } else if (formatted >= 1000) {
//       return formatted.toFixed(1);
//     } else if (formatted >= 1) {
//       return formatted.toFixed(2); // Show up to 2 decimal places if the amount is 1 or more
//     } else {
//       return formatted.toFixed(4); // Show up to 6 decimal places if the amount is less than 1
//     }
//   }

//   const handleClaimlAuction = async (auction: CreatedAuction) => {
//     try {
//       setIsCancelling(true);
//       setCancelledAuctionId(auction.id);
//       const chain_id = Number(auction.auctionChainID);
//       const contractAddress =
//         chain_id === 17000
//           ? addresses.Holesky.AuctionReward
//           : addresses.Amoy.AuctionReward;
//       console.log(auction);
//       console.log(chain_id);
//       console.log(auction.id);
//       console.log(contractAddress);
//       console.log(auction.buyer);
//       await writeContract({
//         address: contractAddress as `0x${string}`,
//         abi: auctionABI,
//         functionName: "acceptAuction",
//         args: [
//           auction.id,
//           auction.auctionChainID,
//           auction.tokenForPayment,
//           auction.endPrice,
//         ],
//         chainId: chain_id,
//       });
//     } catch (error) {
//       console.error("Failed to cancel auction:", error);
//     } finally {
//       setIsCancelling(false);
//       setCancelledAuctionId(null);
//     }
//   };

//   useEffect(() => {
//     if (isSuccess) {
//       setTotalAuctions((prevAuctions) =>
//         prevAuctions.filter((auction) => auction.id !== cancelledAuctionId)
//       );
//       setCancelledAuctionId(null);
//     }
//   }, [isSuccess]);

//   useEffect(() => {
//     console.log("New hash: ", hash);
//   }, [hash]);
//   useEffect(() => {
//     if (isLoading) {
//       toast.loading("Transaction is pending...", { id: hash });
//     }
//   }, [isLoading]);
//   useEffect(() => {
//     if (isError) {
//       toast.error("The transaction failed.", { id: hash });
//     }
//   }, [isError]);
//   useEffect(() => {
//     if (isSuccess) {
//       console.log("Transaction successful, refetching data ...");
//       toast.success(
//         <div className="confirmedTransaction">
//           Transaction hash confirmed!
//           <a
//             href={`https://holesky.etherscan.io/tx/${hash}`}
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             View on Etherscan
//           </a>
//         </div>,
//         { id: hash }
//       );
//     }
//   }, [isSuccess]);

//   return (
//     <div className={styles.interfaceClaim}>
//       {totalClaims.length > 0 ? (
//         totalClaims.map((auction, index) => {
//           const tokenSource = getTokenDetails(auction.tokenForSale);
//           const blockchainSource = getBlockchainDetails(
//             Number(auction.createdAuctionChainId)
//           );
//           const amountForSale = formatTokenAmount(
//             BigInt(auction.amountForSale),
//             tokenSource?.decimals || 18
//           );
//           const tokenDest = getTokenDetails(auction.tokenForAccepting);
//           const blockchainDest = getBlockchainDetails(
//             Number(auction.acceptingOfferChainID)
//           );
//           const amountForPayment = formatTokenAmount(
//             BigInt(auction.endPrice),
//             tokenDest?.decimals || 18
//           );
//           return (
//             <div key={index} className={styles.auctionLine}>
//               <div className={styles.tokensInfo}>
//                 <div className={styles.tokenInfo}>
//                   <div className={styles.divImg}>
//                     <img
//                       src={tokenSource?.image_url}
//                       alt={`Logo of token ${tokenSource?.name}`}
//                     />
//                     <img
//                       src={blockchainSource?.image_url}
//                       alt={`Logo of blockchain ${blockchainSource?.name}`}
//                       className={styles.blockchainDiv}
//                     />
//                   </div>
//                   <div className={styles.textDiv}>
//                     <div>{tokenSource?.ticker}</div>
//                     <div>{amountForSale}</div>
//                   </div>
//                 </div>
//                 <div>→</div>
//                 <div className={styles.tokenInfo}>
//                   <div className={styles.divImg}>
//                     <img
//                       src={tokenDest?.image_url}
//                       alt={`Logo of token ${tokenDest?.name}`}
//                     />
//                     <img
//                       src={blockchainDest?.image_url}
//                       alt={`Logo of blockchain ${blockchainDest?.name}`}
//                       className={styles.blockchainDiv}
//                     />
//                   </div>
//                   <div className={styles.textDiv}>
//                     <div>{tokenDest?.ticker}</div>
//                     <div>{amountForPayment}</div>
//                   </div>
//                 </div>
//               </div>
//               <button
//                 onClick={() => handleClaimlAuction(auction)}
//                 disabled={isCancelling && cancelledAuctionId === auction.id}
//               >
//                 {isCancelling && cancelledAuctionId === auction.id
//                   ? "Claiming..."
//                   : "Claim"}
//               </button>
//             </div>
//           );
//         })
//       ) : (
//         <p>No auctions found or not connected</p>
//       )}
//     </div>
//   );
// };

// export default InterfaceClaim;
