export interface Product {
  id: number;
  seller: string;
  buyer: string;
  name: string;
  description: string;
  imageUrl: string;
  price: bigint;
  sold: boolean;
  transactionDate?: Date;
}

export interface ProductWithOwner extends Product {
  owner: string;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
}
