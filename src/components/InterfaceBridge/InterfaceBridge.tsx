import React, { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import ListTokens from "../ListTokens/ListTokens";
import styles from "./InterfaceBridge.module.scss";
import chainsData from "../../data/chains.json";
import tokensData from "../../data/tokens.json"; // Import tokens data
import auctionABI from "../../ABI/auction.json"; // Import auction ABI
import addresses from "../../ABI/address.json"; // Import addresses
import erc20ABI from "../../ABI/erc20ABI.json"; // Import addresses
import { holesky, polygonAmoy } from "wagmi/chains";
import BigNumber from "bignumber.js";
import { ethers, formatEther, parseEther } from "ethers";
import { toast } from "react-hot-toast";

interface TokenData {
  name: string;
  ticker: string;
  contract: string;
  contract_mainnet: string; // Add contract_mainnet to the interface
  chain_id: number;
  image_url: string;
}

const InterfaceBridge: React.FC = () => {
  const { isConnected, address } = useAccount();
  const { open } = useWeb3Modal();

  const [whatToDisplay, setWhatToDisplay] = useState<
    "inputs" | "tokensSource" | "tokensDest"
  >("inputs");

  const defaultTokenSource: TokenData = {
    ...tokensData.Holesky[0],
    chain_id: 17000,
  };
  const defaultTokenDest: TokenData = {
    ...tokensData.Amoy[2],
    chain_id: 80002,
  };

  const [tokenSource, setTokenSource] = useState<TokenData | null>(
    defaultTokenSource
  );
  const [tokenDest, setTokenDest] = useState<TokenData | null>(
    defaultTokenDest
  );
  const [sourceAmount, setSourceAmount] = useState<number>();
  const [destAmount, setDestAmount] = useState<number>();
  const [prices, setPrices] = useState<{ [key: string]: number }>({});
  const [acceptedRate, setAcceptedRate] = useState<number>(0);
  const [timeFrame, setTimeFrame] = useState<number>(7);
  const [allowance, setAllowance] = useState<BigNumber>(new BigNumber(0));
  const { switchChain } = useSwitchChain();

  const { data: hash, writeContract } = useWriteContract();
  const { isLoading, isSuccess, isError } = useWaitForTransactionReceipt({
    hash,
    pollingInterval: 500,
  });

  const addressContract =
    tokenSource?.chain_id === 17000
      ? addresses.Holesky.AuctionReward
      : addresses.Amoy.AuctionReward;

  const { data: allowanceData } = useReadContract({
    address: tokenSource?.contract as `0x${string}`,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address, addresses.Holesky.AuctionReward],
  });

  useEffect(() => {
    if (tokenSource && tokenSource.chain_id) {
      switchChain({ chainId: tokenSource.chain_id });
    }
  }, [tokenSource?.chain_id]);

  useEffect(() => {
    if (allowanceData) {
      setAllowance(new BigNumber(formatEther(allowanceData as string)));
    }
  }, [allowanceData, sourceAmount]);

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
          ((sourceAmount || 0) * newPrices[tokenSource.contract_mainnet]) /
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
      setAcceptedRate(destAmount || 0);
    }
  };

  const getStepValue = (amount: number): number => {
    if (amount < 1) return 0.00001;
    if (amount < 10) return 0.001;
    if (amount < 100) return 0.01;
    return 0.1;
  };

  useEffect(() => {
    console.log("New hash: ", hash);
  }, [hash]);
  useEffect(() => {
    if (isLoading) {
      toast.loading("Transaction is pending...", { id: hash });
    }
  }, [isLoading]);
  useEffect(() => {
    if (isError) {
      toast.error("The transaction failed.", { id: hash });
    }
  }, [isError]);
  useEffect(() => {
    if (isSuccess) {
      console.log("Transaction successful, refetching data ...");
      toast.success(
        <div className="confirmedTransaction">
          Transaction hash confirmed!
          <a
            href={`https://holesky.etherscan.io/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Etherscan
          </a>
        </div>,
        { id: hash }
      );
    }
  }, [isSuccess]);

  function makeTheBid() {
    console.log("make the biddd");
    const startingPriceInWei = parseEther((acceptedRate || 0).toString());
    const endPriceInWei = parseEther((destAmount || 0).toString());
    const amountForSaleInWei = parseEther((sourceAmount || 0).toString());
    // need to do the same with destAmount
    const args = [
      tokenSource?.contract,
      tokenDest?.contract,
      startingPriceInWei,
      endPriceInWei,
      new BigNumber(timeFrame * 24 * 60 * 60).toString(), // Convert days to seconds
      amountForSaleInWei,
      tokenSource?.chain_id,
      tokenDest?.chain_id,
    ];

    console.log(args);

    try {
      writeContract({
        abi: auctionABI,
        address: addressContract as `0x${string}`,
        functionName: "createAuction",
        args,
        chainId: tokenSource?.chain_id,
      });
      console.log("on ecrit");
    } catch (error) {
      console.error("Failed to create auction:", error);
    }
  }

  const approveToken = async () => {
    console.log("Got for the approve");
    console.log("Current approval: ", allowanceData);
    const valueToApprove = parseEther((sourceAmount || 0).toString());

    const args = [addressContract, valueToApprove];
    console.log("args", args);
    try {
      writeContract({
        abi: erc20ABI,
        address: tokenSource?.contract as `0x${string}`,
        functionName: "approve",
        args,
        chainId: tokenSource?.chain_id,
      });
      console.log("on ecrit");
    } catch (error) {
      console.error("Failed to create auction:", error);
    }
  };

  const switchTokens = () => {
    const tempToken = tokenSource;
    const tempAmount = sourceAmount;
    setTokenSource(tokenDest);
    setTokenDest(tempToken);
    setSourceAmount(destAmount);
    setDestAmount(tempAmount);
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
        <button className={styles.switchBtn} onClick={switchTokens}>
          ↔
        </button>
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
                  placeholder="Amount"
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
                <input
                  type="number"
                  value={destAmount}
                  readOnly
                  placeholder="Recommended value"
                />
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
              step={getStepValue(destAmount || 0)}
              value={acceptedRate}
              onChange={(e) => setAcceptedRate(Number(e.target.value) || 0)}
              className={styles.slider}
            />
          </div>
          <div className={styles.rangeDiv}>
            <div className={styles.firstLineRange}>
              <div>Time frame</div>
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
        allowance.isGreaterThanOrEqualTo(sourceAmount || 0) ? (
          <button className={styles.bridgeButton} onClick={makeTheBid}>
            Click to bridge
          </button>
        ) : (
          <button className={styles.bridgeButton} onClick={approveToken}>
            Approve Token
          </button>
        )
      ) : (
        <button className={styles.bridgeButton} onClick={() => open()}>
          Connect
        </button>
      )}
    </div>
  );
};

export default InterfaceBridge;
