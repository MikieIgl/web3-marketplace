import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface NftMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class AlchemyService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = environment.rpcUrl.split('/').pop() || '';
    this.baseUrl = `https://eth-sepolia.g.alchemy.com/nft/v2/${this.apiKey}`;
  }

  async getNftMetadata(contractAddress: string, tokenId: string): Promise<NftMetadata> {
    const url = `${this.baseUrl}/getNFTMetadata?contractAddress=${contractAddress}&tokenId=${tokenId}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch NFT metadata: ${response.statusText}`);
    }

    return response.json();
  }

  async getNftsForOwner(ownerAddress: string): Promise<any[]> {
    const url = `${this.baseUrl}/getNFTs?owner=${ownerAddress}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch NFTs: ${response.statusText}`);
    }

    const data = await response.json();
    return data.ownedNfts || [];
  }
}
