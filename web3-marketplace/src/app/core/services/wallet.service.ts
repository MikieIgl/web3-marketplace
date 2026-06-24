import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ethers } from 'ethers';
import { WalletState } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  private router = inject(Router);
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private isConnecting = false;
  private autoConnectAttempted = false;
  private accountChangeHandler: ((accounts: string[]) => void) | null = null;

  readonly walletState = signal<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
  });

  readonly isConnected = computed(() => this.walletState().isConnected);
  readonly address = computed(() => this.walletState().address);
  readonly chainId = computed(() => this.walletState().chainId);

  /**
   * Set up account change listener
   */
  private setupAccountChangeListener(): void {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      return;
    }

    (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        this.walletState.set({
          isConnected: false,
          address: null,
          chainId: null,
        });
        this.provider = null;
        this.signer = null;
        this.router.navigate(['/marketplace']);
      } else if (this.walletState().isConnected) {
        const newAddress = accounts[0];
        this.walletState.update((state) => ({
          ...state,
          address: newAddress,
        }));

        if (this.provider) {
          this.provider.getSigner().then((signer) => {
            this.signer = signer;
            this.router.navigate(['/marketplace']);
          });
        }
      }
    });

    (window as any).ethereum.on('chainChanged', (chainId: string) => {
      this.walletState.update((state) => ({
        ...state,
        chainId: Number(chainId),
      }));
    });
  }

  /**
   * Auto-connect on page load - restores session without prompting
   */
  async autoConnect(): Promise<void> {
    if (this.autoConnectAttempted) {
      return;
    }

    if (this.walletState().isConnected) {
      return;
    }

    if (typeof window === 'undefined' || !(window as any).ethereum) {
      this.autoConnectAttempted = true;
      return;
    }

    this.autoConnectAttempted = true;
    this.setupAccountChangeListener();

    try {
      const accounts = await (window as any).ethereum.request({
        method: 'eth_accounts',
      });

      if (accounts && accounts.length > 0) {
        this.provider = new ethers.BrowserProvider((window as any).ethereum);
        this.signer = await this.provider.getSigner();

        const address = await this.signer.getAddress();
        const network = await this.provider.getNetwork();

        this.walletState.set({
          isConnected: true,
          address,
          chainId: Number(network.chainId),
        });
      }
    } catch (error: any) {
      console.warn('Auto-connect failed:', error.message);
    }
  }

  async connect(): Promise<void> {
    if (this.isConnecting) {
      return;
    }

    if (this.walletState().isConnected) {
      return;
    }

    if (typeof window === 'undefined' || !(window as any).ethereum) {
      throw new Error('MetaMask is not installed');
    }

    this.isConnecting = true;
    this.setupAccountChangeListener();

    try {
      const accounts = await Promise.race([
        (window as any).ethereum.request({ method: 'eth_requestAccounts' }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('MetaMask did not respond within 30 seconds')), 30000),
        ),
      ]);

      this.provider = new ethers.BrowserProvider((window as any).ethereum);
      this.signer = await this.provider.getSigner();

      const address = await this.signer.getAddress();
      const network = await this.provider.getNetwork();

      this.walletState.set({
        isConnected: true,
        address,
        chainId: Number(network.chainId),
      });
    } catch (error: any) {
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  async disconnect(): Promise<void> {
    this.provider = null;
    this.signer = null;
    this.walletState.set({
      isConnected: false,
      address: null,
      chainId: null,
    });
    this.router.navigate(['/marketplace']);
  }

  async switchToSepolia(): Promise<void> {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      throw new Error('MetaMask is not installed');
    }

    const sepoliaChainId = '0xaa36a7';

    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: sepoliaChainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        throw new Error('Sepolia network is not configured in MetaMask');
      }
      throw switchError;
    }
  }

  getSigner(): ethers.Signer | null {
    return this.signer;
  }

  getProvider(): ethers.BrowserProvider | null {
    return this.provider;
  }
}
