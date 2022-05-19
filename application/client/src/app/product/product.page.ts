import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ApiService} from '../service/api.service';
import {LoadingController, NavController, ToastController, ViewWillEnter} from '@ionic/angular';
import {UserService} from '../service/user.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
})
export class ProductPage implements ViewWillEnter {

  products: any;

  constructor(
      private api: ApiService,
      private user: UserService,
      private router: NavController,
      private toastCtrl: ToastController,
      private loadingController: LoadingController,
  ) { }

  async ionViewWillEnter() {
    const loading = await this.loadingController.create();
    await loading.present();

    try {
      const response = await this.api.readAllProducts().toPromise();
      this.products = response.result;
      loading.dismiss();
    } catch (error) {
      console.error('error', error);
      this.presentToast(error.error.message);
      loading.dismiss();
    }
  }

  isString(variable) {
    return typeof variable === 'string';
  }

  onLogout() {
    this.user.clearCurrentUser();
    this.router.navigateBack(['/login']);
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
