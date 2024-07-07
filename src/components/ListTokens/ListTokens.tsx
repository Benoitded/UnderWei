import React, { useState } from "react";
import styles from "./ListTokens.module.scss";
import chainsData from "../../data/chains.json";
import tokensData from "../../data/tokens.json";
import { Blockchain, TokensData } from "../../types/generalTypes";

interface ListTokensProps {
  onSelectToken: (token: {
    name: string;
    ticker: string;
    contract: string;
    contract_mainnet: string;
    chain_id: number;
    image_url: string;
  }) => void;
}

const ListTokens: React.FC<ListTokensProps> = ({ onSelectToken }) => {
  const [currentChain, setCurrentChain] = useState<string>("Holesky");

  const chains: Blockchain[] = chainsData;
  const tokens: TokensData = tokensData;

  const getTokensForCurrentChain = () => {
    return tokens[currentChain] || [];
  };

  const getExplorerUrl = () => {
    const chain = chains.find((chain) => chain.name === currentChain);
    return chain ? chain.explorer_url : "#";
  };

  return (
    <div className={styles.container}>
      <div className={styles.chains}>
        {chains.map((chain) => (
          <div
            key={chain.chain_id}
            className={`${styles.chain} ${
              chain.isDisabled ? styles.disabled : ""
            } ${chain.name === currentChain ? styles.selected : ""}`}
            onClick={() => !chain.isDisabled && setCurrentChain(chain.name)}
          >
            <img
              src={chain.image_url}
              alt={`${chain.name} logo`}
              title={chain.name}
            />
          </div>
        ))}
      </div>
      <div className={styles.tokens}>
        {getTokensForCurrentChain().map((token) => (
          <div
            key={token.ticker}
            className={styles.token}
            onClick={() =>
              onSelectToken({
                ...token,
                chain_id:
                  chains.find((chain) => chain.name === currentChain)
                    ?.chain_id || 0,
              })
            }
          >
            <img src={token.image_url} alt={`${token.name} logo`} />
            <div>
              <div className={styles.tickerAndName}>
                <h3>{token.ticker}</h3>
                <p>{token.name}</p>
              </div>
              <p>
                <a
                  href={`${getExplorerUrl()}/address/${token.contract}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {token.contract.slice(0, 5) +
                    "..." +
                    token.contract.slice(-3)}
                </a>
              </p>
            </div>
            <span className={styles.balance}>0.00</span>{" "}
            {/* Placeholder for the balance */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListTokens;
