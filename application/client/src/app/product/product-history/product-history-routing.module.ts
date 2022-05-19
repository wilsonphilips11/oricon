import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductHistoryPage } from './product-history.page';

const routes: Routes = [
  {
    path: '',
    component: ProductHistoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductHistoryPageRoutingModule {}
