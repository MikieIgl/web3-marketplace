import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContractService } from '../../core/services/contract.service';
import { WalletService } from '../../core/services/wallet.service';
import { Product } from '../../core/models/product.model';
import { ethers } from 'ethers';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.less'],
})
export class ProductComponent implements OnInit {
  private contractService = inject(ContractService);
  readonly walletService = inject(WalletService);
  private route = inject(ActivatedRoute);

  product = signal<Product | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  productId = signal<number>(0);

  readonly displayProduct = computed(() => this.product());
  readonly isOwner = computed(() => {
    const p = this.product();
    const address = this.walletService.address();
    if (!p || !address) return false;
    return p.seller.toLowerCase() === address.toLowerCase();
  });
  readonly isBuyer = computed(() => {
    const p = this.product();
    const address = this.walletService.address();
    if (!p || !address) return false;
    return p.buyer && p.buyer.toLowerCase() === address.toLowerCase();
  });

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productId.set(parseInt(id, 10));
      await this.loadProduct(this.productId());
    }
  }

  async loadProduct(id: number): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const item = await this.contractService.getItem(id);
      this.product.set(item);

      // Load transaction date if sold
      if (item.sold && item.buyer && item.buyer !== '0x0000000000000000000000000000000000000000') {
        const txHash = await this.contractService.findSaleTransaction(id);
        if (txHash) {
          const timestamp = await this.contractService.getTransactionTimestamp(txHash);
          if (timestamp) {
            this.product.set({ ...item, transactionDate: timestamp });
          }
        }
      }
    } catch (err: any) {
      console.error('Failed to load product:', err);
      this.error.set('Product not found. Make sure you are on Sepolia testnet.');
      this.product.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  async buyItem(): Promise<void> {
    const p = this.product();
    if (!p || !this.walletService.isConnected()) {
      this.error.set('Please connect your wallet first');
      return;
    }

    try {
      const receipt = await this.contractService.buyItem(p.id, p.price);
      alert('🎉 Purchase successful!\n\nTX: ' + receipt.hash);
      await this.loadProduct(p.id);
    } catch (err: any) {
      // Ignore user rejection - it's not an error, just cancelled
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
    }
  }

  formatPrice(price: bigint): string {
    return ethers.formatEther(price);
  }

  formatAddress(address: string): string {
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
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

  getEtherscanUrl(address: string): string {
    return `https://sepolia.etherscan.io/address/${address}`;
  }
}
