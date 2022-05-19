import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LoadingController, NavController, ToastController} from '@ionic/angular';
import {AuthService} from '../service/auth.service';
import {UserService} from '../service/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  public formGroup: FormGroup;

  constructor(
      private formBuilder: FormBuilder,
      private router: NavController,
      private auth: AuthService,
      private user: UserService,
      private toastCtrl: ToastController,
      private loadingController: LoadingController,
  ) {
    this.formGroup = this.formBuilder.group({
      userid: ['', Validators.compose([Validators.pattern('[a-zA-Z@0-9.]*'), Validators.required])],
      password: ['', Validators.required],
    });
  }

  ngOnInit() {
  }

  async onLogin() {
    const loading = await this.loadingController.create();
    await loading.present();

    try {
      let user;
      let response;
      if (this.formGroup.value.userid === 'Admin@org1.example.com') {
        user = {
          userid: 'Admin@org1.example.com',
          password: '',
          role: 'token-admin'
        };
      } else {
        response = await this.auth.getUser(this.formGroup.value).toPromise();
        user = {
          userid: this.formGroup.value.userid,
          password: this.formGroup.value.password,
          role: response.result.usertype
        };
        this.presentToast(response.status, true);
      }
      this.user.setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));

      loading.dismiss();
      // Route user based its role
      if (this.user.getCurrentUser().role === 'admin') {
        this.router.navigateForward('/home/product');
      } else if (this.user.getCurrentUser().role === 'client') {
        this.router.navigateForward('/home/search');
      } else if (this.user.getCurrentUser().role === 'token-admin') {
        this.router.navigateForward('/home/wallet');
      }
    } catch (error) {
      console.error('error', error);
      this.presentToast(error.error.message);
      loading.dismiss();
    }
  }

  goToEnroll() {
    this.router.navigateForward('/enroll');
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
