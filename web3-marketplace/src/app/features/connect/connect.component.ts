import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WalletService } from '../../core/services/wallet.service';

@Component({
  selector: 'app-connect',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.less'],
})
export class ConnectComponent {
  readonly walletService = inject(WalletService);

  async connect(): Promise<void> {
    try {
      await this.walletService.connect();
    } catch (error: any) {
      alert(`Failed to connect wallet:\n${error.message || error}`);
    }
  }
}
