import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ApiService} from '../../service/api.service';
import {LoadingController, NavController, ToastController} from '@ionic/angular';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.page.html',
  styleUrls: ['./add-product.page.scss'],
})
export class AddProductPage implements OnInit {

  formGroup: FormGroup;
  imageFile: any;
  imagePath: any;
  imageBase64: any;

  constructor(
      private formBuilder: FormBuilder,
      private api: ApiService,
      private toastCtrl: ToastController,
      private router: NavController,
      private loadingController: LoadingController,
  ) {
    this.formGroup = this.formBuilder.group({
      productCode: ['', Validators.required],
      productName: ['', Validators.required],
      productPrice: ['', Validators.required],
      productOrigin: ['', Validators.required],
      productReleaseDate: ['', Validators.required],
      productDescription: ['', Validators.required],
      productImage: ['', Validators.required],
    });
  }

  ngOnInit() {
  }

  async onAdd() {
    delete this.formGroup.value['productImage'];
    this.formGroup.value['productImageBase64'] = this.imageBase64;
    this.formGroup.value['keySize'] = this.api.cryptoParameter;

    const loading = await this.loadingController.create();
    await loading.present();

    try {
      const response = await this.api.createProduct(this.formGroup.value).toPromise();
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
      if ( $event.target.files[0].size < (3 * 1024 * 1024)) {
        this.imageFile = $event.target.files[0];
        this.readImageFile();
      } else {
        this.presentToast('Image size exceeded limit size 1MB');
        this.imageFile = '';
        this.imageBase64 = '';
        return false;
      }
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
