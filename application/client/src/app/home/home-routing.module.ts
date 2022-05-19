import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomePage } from './home.page';
import {AuthGuard} from '../guards/auth.guard';
import {RoleGuard} from '../guards/role.guard';

let userRole = '';
if (localStorage.getItem('currentUser')) {
  userRole = JSON.parse(localStorage.getItem('currentUser')).role;
}

const routes: Routes = [
  {
    path: 'home',
    component: HomePage,
    children: [
      {
        path: 'product',
        loadChildren: () => import('../product/product.module').then(m => m.ProductPageModule),
        canActivate: [AuthGuard, RoleGuard],
        data: {
          role: 'admin'
        }
      },
      {
        path: 'user',
        loadChildren: () => import('../user/user.module').then(m => m.UserPageModule),
        canActivate: [AuthGuard, RoleGuard],
        data: {
          role: 'admin'
        }
      },
      {
        path: 'crypto-configuration',
        loadChildren: () => import('../crypto-configuration/crypto-configuration.module').then(m => m.CryptoConfigurationPageModule),
        canActivate: [AuthGuard, RoleGuard],
        data: {
          role: 'admin'
        }
      },
      {
        path: 'search',
        loadChildren: () => import('../search/search.module').then(m => m.SearchPageModule),
        canActivate: [AuthGuard, RoleGuard],
        data: {
          role: ['admin', 'client']
        }
      },
      {
        path: 'wallet',
        loadChildren: () => import('../wallet/wallet.module').then(m => m.WalletPageModule),
        canActivate: [AuthGuard]
      },
      {
        path: '',
        redirectTo: (userRole === 'admin') ? '/home/product' : '/home/search',
        pathMatch: 'full',
        canActivate: [AuthGuard]
      }
    ]
  },
  {
    path: '',
    redirectTo: (userRole === 'admin') ? '/home/product' : (userRole === 'client') ? '/home/search' : '/home/wallet',
    pathMatch: 'full',
    canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule {}
