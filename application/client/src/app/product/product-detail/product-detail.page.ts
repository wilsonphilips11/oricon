import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ApiService} from '../../service/api.service';
import {AlertController, LoadingController, NavController, ToastController} from '@ionic/angular';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
})
export class ProductDetailPage implements OnInit {

  productCode: any;
  loadedProduct: any;

  qrCodeElementType = 'canvas';
  qrCodeValue;

  constructor(
      private route: ActivatedRoute,
      private api: ApiService,
      private router: NavController,
      private toastCtrl: ToastController,
      private alertCtrl: AlertController,
      private loadingController: LoadingController,
  ) { }

  async ngOnInit() {
    this.productCode = this.route.snapshot.paramMap.get('productCode');

    const loading = await this.loadingController.create();
    await loading.present();

    try {
      const response = await this.api.readProduct(this.productCode).toPromise();
      this.loadedProduct = response.result;
      loading.dismiss();
    } catch (error) {
      console.error('error', error);
      this.presentToast(error.error.message);
      loading.dismiss();
    }
  }

  async onDelete() {
    const loading = await this.loadingController.create();
    await loading.present();

    try {
      const response = await this.api.deleteProduct(this.productCode).toPromise();
      this.presentToast(response.status, true);
      this.router.navigateBack('/home/product');
      loading.dismiss();
    } catch (error) {
      console.error('error', error);
      this.presentToast(error.error.message);
      loading.dismiss();
    }
  }

  downloadQrCode() {
    const canvas = document.querySelector(".qr-code > canvas") as HTMLCanvasElement;
    const resizedCanvas = document.createElement("canvas");
    resizedCanvas.height = 500;
    resizedCanvas.width = 500;
    const resizedContext = resizedCanvas.getContext("2d");
    resizedContext.drawImage(canvas, 0, 0, resizedCanvas.width, resizedCanvas.height);
    const qrCodeImage = resizedCanvas.toDataURL('image/jpeg').toString();

    fetch(qrCodeImage)
        .then(res => res.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${this.loadedProduct.productName}.jpg`;
          link.click();
        });
  }

  async presentToast(toastMessage, success = false) {
    const toast = await this.toastCtrl.create({
      message: toastMessage,
      duration: 2000,
      color: success ? 'success' : 'danger'
    });
    toast.present();
  }

  async presentAlert() {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Delete Product',
      message: 'Are you sure to delete this product?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Okay',
          handler: () => {
            this.onDelete();
          }
        }
      ]
    });

    await alert.present();
    await alert.onDidDismiss();
  }

}
