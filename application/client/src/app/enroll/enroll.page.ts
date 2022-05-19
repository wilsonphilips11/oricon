import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LoadingController, NavController, ToastController} from '@ionic/angular';
import {AuthService} from '../service/auth.service';

@Component({
  selector: 'app-enroll',
  templateUrl: './enroll.page.html',
  styleUrls: ['./enroll.page.scss'],
})
export class EnrollPage implements OnInit {

  formGroup: FormGroup;

  constructor(
      private formBuilder: FormBuilder,
      private router: NavController,
      private auth: AuthService,
      private toastCtrl: ToastController,
      private loadingController: LoadingController,
  ) {
    this.formGroup = this.formBuilder.group({
      userid: ['', Validators.compose([Validators.pattern('[a-zA-Z ]*'), Validators.required])],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
  }

  async onEnroll() {
    const loading = await this.loadingController.create();
    await loading.present();

    try {
      const response = await this.auth.enroll(this.formGroup.value).toPromise();
      this.presentToast(response.status, true);
      this.router.navigateForward('/login');
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
