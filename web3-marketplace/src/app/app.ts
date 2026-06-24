import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { WalletButtonComponent } from './shared/components/wallet-button/wallet-button.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, WalletButtonComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.less'],
})
export class App {}
