import { Component, inject, effect, signal, HostListener } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { WalletService } from '../../../core/services/wallet.service';

@Component({
  selector: 'app-wallet-button',
  standalone: true,
  imports: [SlicePipe],
  templateUrl: './wallet-button.component.html',
  styleUrls: ['./wallet-button.component.less'],
})
export class WalletButtonComponent {
  readonly walletService = inject(WalletService);
  menuOpen = false;

  readonly isConnected = signal(false);
  readonly address = signal<string | null>(null);

  constructor() {
    effect(() => {
      const state = this.walletService.walletState();
      this.isConnected.set(state.isConnected);
      this.address.set(state.address);
      if (state.isConnected) {
        this.menuOpen = false;
      }
    });
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const button = target.closest('app-wallet-button');
    if (!button && this.menuOpen) {
      this.menuOpen = false;
    }
  }

  async connect(): Promise<void> {
    try {
      await this.walletService.connect();
    } catch (error: any) {
      alert(`Failed to connect wallet:\n${error.message || error}`);
    }
  }

  async disconnect(): Promise<void> {
    this.menuOpen = false;
    await this.walletService.disconnect();

    setTimeout(() => {
      alert(
        'Wallet disconnected from the app.\n\nTo fully revoke access, disconnect in MetaMask:\nMetaMask → Settings → Connections → This site',
      );
    }, 100);
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  async copyAddress(): Promise<void> {
    const addr = this.address();
    if (addr) {
      await navigator.clipboard.writeText(addr);
      alert('Address copied!');
    }
    this.menuOpen = false;
  }

  switchAccount(): void {
    this.menuOpen = false;
    alert(
      'To switch accounts:\n\n1. Click the MetaMask extension icon\n2. Select a different account\n3. This app will automatically update',
    );
  }
}
