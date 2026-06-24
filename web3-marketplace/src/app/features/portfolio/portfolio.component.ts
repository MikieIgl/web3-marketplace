import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContractService } from '../../core/services/contract.service';
import { WalletService } from '../../core/services/wallet.service';
import { Product } from '../../core/models/product.model';
import { ethers } from 'ethers';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.less'],
})
export class PortfolioComponent implements OnInit {
  private contractService = inject(ContractService);
  readonly walletService = inject(WalletService);

  purchasedItems = signal<Product[]>([]);
  loading = signal(false);
  totalSpent = signal('0');
  walletNotConnected = signal(false);

  readonly displayItems = computed(() => {
    if (this.walletNotConnected()) {
      return [];
    }
    return this.purchasedItems();
  });

  async ngOnInit(): Promise<void> {
    await this.loadPurchasedItems();
  }

  async loadPurchasedItems(): Promise<void> {
    this.loading.set(true);
    this.walletNotConnected.set(false);

    try {
      if (!this.walletService.isConnected()) {
        this.walletNotConnected.set(true);
        this.loading.set(false);
        return;
      }

      const address = this.walletService.address();
      if (!address) {
        this.walletNotConnected.set(true);
        this.loading.set(false);
        return;
      }

      const items = await this.contractService.getItemsByBuyer(address);

      // Load transaction dates for purchased items
      const itemsWithDates = await Promise.all(
        items.map(async (item) => {
          const txHash = await this.contractService.findSaleTransaction(item.id);
          if (txHash) {
            const timestamp = await this.contractService.getTransactionTimestamp(txHash);
            if (timestamp) {
              return { ...item, transactionDate: timestamp };
            }
          }
          return item;
        }),
      );

      this.purchasedItems.set(itemsWithDates);
      this.totalSpent.set(this.calculateTotalSpent());
    } catch (err: any) {
      if (err.message?.includes('Wallet not connected') || err.message?.includes('Signer')) {
        this.walletNotConnected.set(true);
      } else {
        console.error('Failed to load purchased items:', err);
      }
    } finally {
      this.loading.set(false);
    }
  }

  async connectWallet(): Promise<void> {
    try {
      await this.walletService.connect();
      await this.loadPurchasedItems();
    } catch (error: any) {
      alert(`Failed to connect wallet:\n${error.message || error}`);
    }
  }

  calculateTotalSpent(): string {
    const total = this.purchasedItems().reduce((sum, item) => sum + item.price, 0n);
    return ethers.formatEther(total);
  }

  formatPrice(price: bigint): string {
    return ethers.formatEther(price);
  }

  formatDate(date?: Date): string {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
