import { Component, OnInit } from '@angular/core';
import {ApiService} from '../service/api.service';
import {UserService} from '../service/user.service';
import {LoadingController, NavController} from '@ionic/angular';

@Component({
  selector: 'app-crypto-configuration',
  templateUrl: './crypto-configuration.page.html',
  styleUrls: ['./crypto-configuration.page.scss'],
})
export class CryptoConfigurationPage implements OnInit {
  checkedValue;

  constructor(
      private api: ApiService,
      private user: UserService,
      private router: NavController
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.checkedValue = localStorage.getItem('kyberKey');
  }

  changeParameter($event) {
    // console.log('Chosen value: ', $event.target.value);
    this.checkedValue = $event.target.value;
    this.api.cryptoParameter = this.checkedValue;
    localStorage.setItem('kyberKey', this.checkedValue.toString());
    // this.api.checkParams();
  }

  // async submit($event) {
  //   const response = await this.api.createProductParams().toPromise();
  //   console.log('create response: ', response);
  // }
  //
  // async delete($event) {
  //   const response = await this.api.deleteProductParams().toPromise();
  //   console.log('delete response: ', response);
  // }

  onLogout() {
    this.user.clearCurrentUser();
    this.router.navigateBack(['/login']);
  }
}
