import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CryptoConfigurationPage } from './crypto-configuration.page';

const routes: Routes = [
  {
    path: '',
    component: CryptoConfigurationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CryptoConfigurationPageRoutingModule {}
