import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  APP_INITIALIZER,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { WalletService } from './core/services/wallet.service';
import { routes } from './app.routes';

export function initWallet(walletService: WalletService) {
  return () => walletService.autoConnect();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    {
      provide: APP_INITIALIZER,
      useFactory: initWallet,
      deps: [WalletService],
      multi: true,
    },
  ],
};
