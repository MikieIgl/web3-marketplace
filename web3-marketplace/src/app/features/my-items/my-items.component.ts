import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContractService } from '../../core/services/contract.service';
import { WalletService } from '../../core/services/wallet.service';
import { Product } from '../../core/models/product.model';
import { ethers } from 'ethers';

@Component({
  selector: 'app-my-items',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-items.component.html',
  styleUrls: ['./my-items.component.less'],
})
export class MyItemsComponent implements OnInit {
  private contractService = inject(ContractService);
  private walletService = inject(WalletService);

  items = signal<Product[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  readonly hasItems = computed(() => this.items().length > 0);
  readonly isConnected = computed(() => this.walletService.isConnected());

  async ngOnInit(): Promise<void> {
    if (this.walletService.isConnected()) {
      await this.loadItems();
    }
  }

  async connectWallet(): Promise<void> {
    try {
      await this.walletService.connect();
      await this.loadItems();
    } catch (error: any) {
      alert(`Failed to connect wallet:\n${error.message || error}`);
    }
  }

  async loadItems(): Promise<void> {
    if (!this.walletService.address()) {
      this.error.set('Please connect your wallet');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const allItems = await this.contractService.getAllItems();
      const userAddress = this.walletService.address()!.toLowerCase();

      const myItems = allItems.filter(
        (item) => item.seller.toLowerCase() === userAddress && !item.sold,
      );

      this.items.set(myItems);
    } catch (err: any) {
      console.error('Failed to load items:', err);
      this.error.set('Failed to load your items');
    } finally {
      this.loading.set(false);
    }
  }

  formatPrice(price: bigint): string {
    return ethers.formatEther(price);
  }

  formatAddress(address: string): string {
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  }
}
