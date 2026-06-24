import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContractService } from '../../core/services/contract.service';
import { WalletService } from '../../core/services/wallet.service';
import { Product } from '../../core/models/product.model';
import { ethers } from 'ethers';

@Component({
  selector: 'app-sold',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sold.component.html',
  styleUrls: ['./sold.component.less'],
})
export class SoldComponent implements OnInit {
  private contractService = inject(ContractService);
  readonly walletService = inject(WalletService);

  soldItems = signal<Product[]>([]);
  loading = signal(false);
  totalEarned = signal('0');
  walletNotConnected = signal(false);

  readonly displayItems = computed(() => {
    if (this.walletNotConnected()) {
      return [];
    }
    return this.soldItems();
  });

  async ngOnInit(): Promise<void> {
    await this.loadSoldItems();
  }

  async loadSoldItems(): Promise<void> {
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

      const allItems = await this.contractService.getAllItems();
      const sold = allItems.filter(
        (item) => item.seller.toLowerCase() === address.toLowerCase() && item.sold,
      );

      this.soldItems.set(sold);
      this.totalEarned.set(this.calculateTotalEarned());
    } catch (err: any) {
      if (err.message?.includes('Wallet not connected') || err.message?.includes('Signer')) {
        this.walletNotConnected.set(true);
      } else {
        console.error('Failed to load sold items:', err);
      }
    } finally {
      this.loading.set(false);
    }
  }

  async connectWallet(): Promise<void> {
    try {
      await this.walletService.connect();
      await this.loadSoldItems();
    } catch (error: any) {
      alert(`Failed to connect wallet:\n${error.message || error}`);
    }
  }

  calculateTotalEarned(): string {
    const total = this.soldItems().reduce((sum, item) => sum + item.price, 0n);
    return ethers.formatEther(total);
  }

  formatPrice(price: bigint): string {
    return ethers.formatEther(price);
  }
}
