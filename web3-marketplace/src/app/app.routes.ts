import { Routes } from '@angular/router';
import { MarketplaceComponent } from './features/marketplace/marketplace.component';
import { PortfolioComponent } from './features/portfolio/portfolio.component';
import { ConnectComponent } from './features/connect/connect.component';
import { ProductComponent } from './features/product/product.component';
import { SellComponent } from './features/sell/sell.component';
import { SoldComponent } from './features/sold/sold.component';
import { MyItemsComponent } from './features/my-items/my-items.component';

export const routes: Routes = [
  { path: '', redirectTo: 'marketplace', pathMatch: 'full' },
  { path: 'marketplace', component: MarketplaceComponent },
  { path: 'sell', component: SellComponent },
  { path: 'sold', component: SoldComponent },
  { path: 'portfolio', component: PortfolioComponent },
  { path: 'my-items', component: MyItemsComponent },
  { path: 'connect', component: ConnectComponent },
  { path: 'product/:id', component: ProductComponent },
];
