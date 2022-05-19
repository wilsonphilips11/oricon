import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {ApiService} from '../../service/api.service';
import {LoadingController, NavController, ToastController} from '@ionic/angular';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.page.html',
  styleUrls: ['./edit-product.page.scss'],
})
export class EditProductPage implements OnInit {

  formGroup: FormGroup;
  loadedProduct: any;
  imageFile: any;
  imagePath: any;
  imageBase64: any;
  productCode: any;
  imageHash: any;

  constructor(
      private formBuilder: FormBuilder,
      private route: ActivatedRoute,
      private api: ApiService,
      private toastCtrl: ToastController,
      private router: NavController,
      private loadingController: LoadingController,
  ) {
    this.formGroup = this.formBuilder.group({
      productName: ['', Validators.required],
      productPrice: ['', Validators.required],
      productOrigin: ['', Validators.required],
      productReleaseDate: ['', Validators.required],
      productDescription: ['', Validators.required],
      productImage: [''],
    });
  }

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

  async onEdit() {
    delete this.formGroup.value['productImage'];
    this.formGroup.value['productCode'] = this.productCode;
    this.formGroup.value['productImageBase64'] = this.imageBase64 ? this.imageBase64 : this.loadedProduct.productImageBase64;
    this.formGroup.value['keySize'] = this.api.cryptoParameter;

    const loading = await this.loadingController.create();
    await loading.present();

    try {
      const response = await this.api.updateProduct(this.formGroup.value).toPromise();
      this.presentToast(response.status, true);
      this.router.navigateBack('/home/product');
      loading.dismiss();
    } catch (error) {
      console.error('error', error);
      this.presentToast(error.error.message);
      loading.dismiss();
    }
  }

  saveImageFile($event) {
    if ($event.target.files[0]) {
      this.imageFile = $event.target.files[0];
      this.readImageFile();
    } else {
      this.imageFile = '';
      this.imageBase64 = '';
    }
  }

  readImageFile() {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imageBase64 = e.target.result;
    };
    reader.readAsDataURL(this.imageFile);
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
