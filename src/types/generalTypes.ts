export interface Blockchain {
  name: string;
  chain_id: number;
  image_url: string;
  isDisabled: boolean;
  explorer_url: string;
}

export interface Token {
  name: string;
  ticker: string;
  image_url: string;
  contract: string;
  contract_mainnet: string;
  decimals: number;
}

export interface TokensData {
  [key: string]: Token[];
}
