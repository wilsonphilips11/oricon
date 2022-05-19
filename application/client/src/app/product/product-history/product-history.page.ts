import { Component, OnInit } from '@angular/core';
import {ApiService} from '../../service/api.service';
import {ActivatedRoute} from '@angular/router';
import {LoadingController, ToastController} from "@ionic/angular";

@Component({
  selector: 'app-product-history',
  templateUrl: './product-history.page.html',
  styleUrls: ['./product-history.page.scss'],
})
export class ProductHistoryPage implements OnInit {

  productHistory: any;
  productCode: any;

  constructor(
      private api: ApiService,
      private route: ActivatedRoute,
      private toastCtrl: ToastController,
      private loadingController: LoadingController,
  ) { }

  async ngOnInit() {
    const loading = await this.loadingController.create();
    await loading.present();

    try {
      this.productCode = this.route.snapshot.paramMap.get('productCode');
      const response = await this.api.productHistory(this.productCode).toPromise();
      this.productHistory = response.result;
      loading.dismiss();
    } catch (error) {
      console.error('error', error);
      this.presentToast(error.error.message);
      loading.dismiss();
    }
  }

  async presentToast(toastMessage, success = false) {
    const toast = await this.toastCtrl.create({
      message: toastMessage,
      duration: 2000,
      color: success ? 'success' : 'danger'
    });
    toast.present();
  }
}
