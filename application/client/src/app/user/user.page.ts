import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PasswordValidator} from '../validators/password';
import {AuthService} from '../service/auth.service';
import {LoadingController, NavController, ToastController} from '@ionic/angular';
import {UserService} from '../service/user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})
export class UserPage implements OnInit {

  selectTabs = 'userList';
  formGroup: FormGroup;
  cancelNullAttempt = false;
  users: any;

  constructor(
      private formBuilder: FormBuilder,
      private auth: AuthService,
      private toastCtrl: ToastController,
      private router: NavController,
      private user: UserService,
      private loadingController: LoadingController,
  ) {
    this.formGroup = this.formBuilder.group({
      userid: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
      password: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
      confirmPassword: ['', PasswordValidator.checkConfirmPassword],
      usertype: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadUserList();
  }

  async loadUserList() {
    const loading = await this.loadingController.create();
    await loading.present();

    try {
      const response = await this.auth.getAllUsers().toPromise();
      this.users = response.result;
      this.users.forEach(async user => {
        const response = await this.auth.isUserEnrolled(user.id).toPromise();
        user['isEnrolled'] = response.isEnrolled;
      });
      loading.dismiss();
    } catch (error) {
      console.error('error', error);
      this.presentToast(error);
      loading.dismiss();
    }
  }

  checkUserList($event) {
    if (this.selectTabs === 'userList') {
      this.loadUserList();
    }
  }

  onCancelSelect() {
    if (this.formGroup.value.usertype === '') {
      this.cancelNullAttempt = true;
    }
  }

  async onRegister() {
    const loading = await this.loadingController.create();
    await loading.present();

    try {
      delete this.formGroup.value['confirmPassword'];
      const response = await this.auth.register(this.formGroup.value).toPromise();
      this.presentToast(response.status, true);
      loading.dismiss();
    } catch (error) {
      console.error('error', error);
      this.presentToast(error);
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

  onLogout() {
    this.user.clearCurrentUser();
    this.router.navigateBack(['/login']);
  }

}
