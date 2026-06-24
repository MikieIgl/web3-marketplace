import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContractService } from '../../core/services/contract.service';
import { WalletService } from '../../core/services/wallet.service';
import { Product } from '../../core/models/product.model';
import { ethers } from 'ethers';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.less'],
})
export class MarketplaceComponent implements OnInit {
  private contractService = inject(ContractService);
  readonly walletService = inject(WalletService);

  products = signal<Product[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  buyingProductId = signal<number | null>(null);
  currentPage = signal(1);
  readonly itemsPerPage = 6;

  readonly totalPages = computed(() => {
    const total = this.products().length;
    return Math.max(1, Math.ceil(total / this.itemsPerPage));
  });

  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  readonly displayProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.products().slice(start, end);
  });

  readonly hasProducts = computed(() => this.products().length > 0);

  async ngOnInit(): Promise<void> {
    await this.loadProducts();
  }

  async loadProducts(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    this.currentPage.set(1);

    try {
      const items = await this.contractService.getAllItems();

      const sorted = items.sort((a, b) => {
        if (a.sold === b.sold) return Number(a.id) - Number(b.id);
        return a.sold ? 1 : -1;
      });

      this.products.set(sorted);
    } catch (err: any) {
      console.error('Failed to load products:', err);
      this.error.set(
        err.message?.includes('Unable to connect')
          ? err.message
          : 'Failed to load products. Please refresh the page.',
      );
    } finally {
      this.loading.set(false);
    }
  }

  async buyItem(product: Product): Promise<void> {
    if (!this.walletService.isConnected()) {
      await this.walletService.connect();
      return;
    }

    this.buyingProductId.set(product.id);

    try {
      await this.contractService.buyItem(product.id, product.price);
      alert('🎉 Purchase successful!');
      await this.loadProducts();
    } catch (err: any) {
      if (err.code === 'ACTION_REJECTED' || err.code === 4001 || err.reason === 'rejected') {
        console.log('Transaction cancelled by user');
        return;
      }

      if (err.reason === 'Cannot buy your own item') {
        alert('⚠️ You cannot buy your own item');
      } else {
        this.error.set(`Purchase failed: ${err.message}`);
      }
      console.error(err);
    } finally {
      this.buyingProductId.set(null);
    }
  }

  async connectWallet(): Promise<void> {
    try {
      await this.walletService.connect();
    } catch (error: any) {
      alert(`Failed to connect wallet:\n${error.message || error}`);
    }
  }

  formatPrice(price: bigint): string {
    return ethers.formatEther(price);
  }

  goToPage(page: number): void {
    const totalPages = this.totalPages();
    if (page >= 1 && page <= totalPages) {
      this.currentPage.set(page);
    }
  }

  prevPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }
}
