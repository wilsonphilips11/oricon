import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CryptoConfigurationPageRoutingModule } from './crypto-configuration-routing.module';

import { CryptoConfigurationPage } from './crypto-configuration.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CryptoConfigurationPageRoutingModule
  ],
  declarations: [CryptoConfigurationPage]
})
export class CryptoConfigurationPageModule {}
