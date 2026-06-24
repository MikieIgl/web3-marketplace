import { Injectable, inject } from '@angular/core';
import { ethers, Contract, BrowserProvider } from 'ethers';
import { WalletService } from './wallet.service';
import { Product } from '../models/product.model';
import MARKETPLACE_ABI from '../../contracts/abis/marketplace.abi.json';
import { getContractAddress } from '../../contracts/addresses';

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  private walletService = inject(WalletService);

  private async getContract(readOnly: boolean = false) {
    let signer = null;
    let provider = null;

    if (!readOnly) {
      signer = this.walletService.getSigner();
      provider = this.walletService.getProvider();
    } else {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        provider = new BrowserProvider((window as any).ethereum);
      }
    }

    if (!signer && !provider) {
      throw new Error('Wallet not connected');
    }

    const chainId = provider ? (await provider.getNetwork()).chainId : 11155111n;

    const contractAddress = getContractAddress(Number(chainId));
    const contract = new Contract(contractAddress, MARKETPLACE_ABI, signer || provider);

    return contract;
  }

  async getAllItems(): Promise<Product[]> {
    try {
      const contract = await this.getContract(true);
      const items = await contract['getAllItems']();

      return items.map((item: any) => ({
        id: Number(item.id),
        seller: item.seller,
        buyer: item.buyer,
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,
        price: BigInt(item.price),
        sold: item.sold,
      }));
    } catch (err: any) {
      if (err.code === 'CALL_EXCEPTION' || err.reason === 'missing revert data') {
        console.error('Contract call failed - check network/connection:', err);
        throw new Error('Unable to connect to marketplace. Please check your network and wallet.');
      }
      throw err;
    }
  }

  async buyItem(id: number, price: bigint): Promise<any> {
    const signer = this.walletService.getSigner();
    if (!signer) {
      throw new Error('Wallet not connected');
    }

    const contract = await this.getContract();
    const tx = await contract['buyItem'](id, { value: price });
    return await tx.wait();
  }

  async listItem(
    name: string,
    description: string,
    imageUrl: string,
    price: bigint,
  ): Promise<void> {
    const signer = this.walletService.getSigner();
    if (!signer) {
      throw new Error('Wallet not connected');
    }

    const contract = await this.getContract();
    const tx = await contract['listItem'](name, description, imageUrl, price);
    await tx.wait();
  }

  async getItemsByBuyer(buyerAddress: string): Promise<Product[]> {
    const contract = await this.getContract();
    const items = await contract['getItemsByBuyer'](buyerAddress);

    return items.map((item: any) => ({
      id: Number(item.id),
      seller: item.seller,
      buyer: item.buyer,
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
      price: BigInt(item.price),
      sold: item.sold,
    }));
  }

  async getItem(id: number): Promise<Product> {
    const contract = await this.getContract();

    const items = await contract['getAllItems']();

    const item = items.find((i: any) => Number(i.id) === id);

    if (!item) {
      throw new Error(`Item with ID ${id} not found`);
    }

    return {
      id: Number(item.id),
      seller: item.seller,
      buyer: item.buyer,
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
      price: BigInt(item.price),
      sold: item.sold,
    };
  }

  /**
   * Get transaction details from blockchain
   */
  async getTransactionDetails(txHash: string): Promise<{
    hash: string;
    blockNumber: number;
    timestamp: Date;
    from: string;
    to: string;
    value: string;
    gasPrice: string;
    gasUsed: number;
    status: string;
  } | null> {
    try {
      const provider = this.walletService.getProvider();
      if (!provider) return null;

      const tx = await provider.getTransaction(txHash);
      if (!tx || !tx.blockNumber) return null;

      const receipt = await provider.getTransactionReceipt(txHash);
      if (!receipt) return null;

      const block = await provider.getBlock(tx.blockNumber);

      return {
        hash: tx.hash,
        blockNumber: Number(tx.blockNumber),
        timestamp: block ? new Date(Number(block.timestamp) * 1000) : new Date(),
        from: tx.from,
        to: tx.to || '',
        value: ethers.formatEther(tx.value),
        gasPrice: ethers.formatUnits(tx.gasPrice || 0, 'gwei') + ' Gwei',
        gasUsed: Number(receipt.gasUsed),
        status: receipt.status === 1 ? 'Success' : 'Failed',
      };
    } catch (err) {
      console.error('Failed to get transaction details:', err);
      return null;
    }
  }

  /**
   * Get transaction timestamp by hash
   */
  async getTransactionTimestamp(txHash: string): Promise<Date | null> {
    try {
      const provider = this.walletService.getProvider();
      if (!provider) return null;

      const tx = await provider.getTransaction(txHash);
      if (!tx || !tx.blockNumber) return null;

      const block = await provider.getBlock(tx.blockNumber);
      return block ? new Date(Number(block.timestamp) * 1000) : null;
    } catch (err) {
      console.error('Failed to get transaction timestamp:', err);
      return null;
    }
  }

  /**
   * Find transaction hash for item sale
   */
  async findSaleTransaction(itemId: number): Promise<string | null> {
    try {
      const provider = this.walletService.getProvider();
      if (!provider) return null;

      const contractAddress = '0x79ec3e60860EeBb331eEf6efcCD16Fa2b4Eb39c6';
      const itemSoldTopic = ethers.id('ItemSold(uint256,address,address)');

      const logs = await provider.getLogs({
        address: contractAddress,
        topics: [itemSoldTopic],
        fromBlock: 0n,
        toBlock: 'latest',
      });

      const iface = new ethers.Interface(MARKETPLACE_ABI);

      for (const log of logs) {
        try {
          const parsedLog = iface.parseLog({
            topics: log.topics as string[],
            data: log.data,
          });

          if (parsedLog && parsedLog.args[0] === BigInt(itemId)) {
            return log.transactionHash;
          }
        } catch (e) {}
      }
    } catch (err) {
      console.error('Failed to find sale transaction:', err);
    }
    return null;
  }
}
