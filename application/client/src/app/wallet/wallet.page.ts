import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PasswordValidator} from '../validators/password';
import {TokenService} from '../service/token.service';
import {LoadingController, NavController, ToastController} from '@ionic/angular';
import {UserService} from '../service/user.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
})
export class WalletPage implements OnInit {

  selectTabs = 'allowance';
  formGroup: FormGroup;
  tokenDetails: any;
  allowances: any;
  transferOptions = 'transfer';

  constructor(
      private formBuilder: FormBuilder,
      private token: TokenService,
      private toastCtrl: ToastController,
      public user: UserService,
      private router: NavController,
      private loadingController: LoadingController,
  ) { }

  async ngOnInit() {
    const loading = await this.loadingController.create();
    await loading.present();

    try {
      let response = await this.token.getTokenDetails().toPromise();
      this.tokenDetails = response.result;
      response = await this.token.getAllowanceToken().toPromise();
      this.allowances = response.result;
      loading.dismiss();
    } catch (error) {
      console.error('error', error);
      this.presentToast(error.error.message);
      loading.dismiss();
    }
  }

  onSegmentChange($event) {
    this.transferOptions = 'transfer';
    if ($event.detail.value === 'transfer') {
      this.formGroup = this.formBuilder.group({
        receiver: ['', Validators.required],
        value: ['', Validators.required],
      });
    } else if ($event.detail.value === 'approve') {
      this.formGroup = this.formBuilder.group({
        spender: ['', Validators.required],
        value: ['', Validators.required],
      });
    } else if ($event.detail.value === 'mint') {
      this.formGroup = this.formBuilder.group({
        value: ['', Validators.required],
      });
    }
  }

  onSelectTransfer($event) {
    if ($event.detail.value === 'transfer') {
      this.transferOptions = 'transfer';
      this.formGroup = this.formBuilder.group({
        receiver: ['', Validators.required],
        value: ['', Validators.required],
      });
    } else if ($event.detail.value === 'transfer-from') {
      this.transferOptions = 'transfer-from';
      this.formGroup = this.formBuilder.group({
        owner: ['', Validators.required],
        spender: ['', Validators.required],
        value: ['', Validators.required],
      });
    }
  }

  async onTransferToken() {
    const loading = await this.loadingController.create();
    await loading.present();

    try {
      const response = await this.token.transferToken(this.formGroup.value).toPromise();
      this.tokenDetails.tokenBalance = response.result.balance;
      this.presentToast(response.status, true);
      loading.dismiss();
    } catch (error) {
      console.error('error', error);
      this.presentToast(error.error.message);
      loading.dismiss();
    }
  }

  async onTransferFromToken() {
    const loading = await this.loadingController.create();
    await loading.present();

    try {
      const response = await this.token.transferFromToken(this.formGroup.value).toPromise();
      this.presentToast(response.status, true);
      loading.dismiss();
    } catch (error) {
      console.error('error', error);
      this.presentToast(error.error.message);
      loading.dismiss();
    }
  }

  async onApproveToken() {
    const loading = await this.loadingController.create();
    await loading.present();

    try {
      const response = await this.token.approveToken(this.formGroup.value).toPromise();
      if (!this.isString(this.allowances)) {
        this.allowances.forEach((allowance, idx, array) => {
          if (allowance.spender === this.formGroup.value.spender) {
            allowance.value = response.result.allowance;
          }
          if (idx === array.length - 1 && allowance.spender !== this.formGroup.value.spender) {
            this.allowances.push({
              spender: this.formGroup.value.spender,
              value: response.result.allowance
            });
          }
        });
      } else {
        this.allowances = {
          spender: this.formGroup.value.spender,
          value: response.result.allowance
        };
      }
      this.presentToast(response.status, true);
      loading.dismiss();
    } catch (error) {
      console.error('error', error);
      this.presentToast(error.error.message);
      loading.dismiss();
    }
  }

  async onMintToken() {
    const loading = await this.loadingController.create();
    await loading.present();

    try {
      const response = await this.token.mintToken(this.formGroup.value).toPromise();
      this.tokenDetails.tokenBalance += this.formGroup.value;
      this.tokenDetails.totalSupply = response.result.totalSupply;
      this.presentToast(response.status, true);
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

  isString(variable) {
    return typeof variable === 'string';
  }

  onLogout() {
    this.user.clearCurrentUser();
    this.router.navigateBack(['/login']);
  }

}
