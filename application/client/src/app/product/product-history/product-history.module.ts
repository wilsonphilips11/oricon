import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductHistoryPageRoutingModule } from './product-history-routing.module';

import { ProductHistoryPage } from './product-history.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProductHistoryPageRoutingModule
  ],
  declarations: [ProductHistoryPage]
})
export class ProductHistoryPageModule {}
