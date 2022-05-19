import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EnrollPageRoutingModule } from './enroll-routing.module';

import { EnrollPage } from './enroll.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    EnrollPageRoutingModule
  ],
  declarations: [EnrollPage]
})
export class EnrollPageModule {}
