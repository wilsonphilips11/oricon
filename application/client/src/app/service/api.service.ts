import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import { environment } from '../../environments/environment';
import {UserService} from './user.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  baseUrl = environment.apiBaseUrl;
  cryptoParameter = '768';

  constructor(
      private httpClient: HttpClient,
      private user: UserService
  ) {
    if (!localStorage.getItem('kyberKey')) {
      localStorage.setItem('kyberKey', this.cryptoParameter);
    } else {
      this.cryptoParameter = localStorage.getItem('kyberKey');
    }
  }

  createAuthorizationHeader(headers: HttpHeaders) {
    const currentUser = this.user.getCurrentUser();
    return headers.append('Authorization', 'Basic ' + btoa(this.user.currentUser.userid + ':' + this.user.currentUser.password));
  }

  readAllProducts() {
    let headers = new HttpHeaders();
    headers = this.createAuthorizationHeader(headers);
    return this.httpClient.get<any>(this.baseUrl + '/api/products/' + this.cryptoParameter, {headers});
  }

  readProduct(productCode) {
    let headers = new HttpHeaders();
    headers = this.createAuthorizationHeader(headers);
    return this.httpClient.get<any>(this.baseUrl + '/api/products/' + productCode + '/' +  + this.cryptoParameter, {headers});
  }

  createProduct(productDetailsBody) {
    let headers = new HttpHeaders();
    headers = this.createAuthorizationHeader(headers);
    return this.httpClient.post<any>(this.baseUrl + '/api/create-product/', productDetailsBody, {headers});
  }

  updateProduct(productDetailsBody) {
    let headers = new HttpHeaders();
    headers = this.createAuthorizationHeader(headers);
    return this.httpClient.put<any>(this.baseUrl + '/api/update-product/', productDetailsBody, {headers});
  }

  deleteProduct(productCode) {
    let headers = new HttpHeaders();
    headers = this.createAuthorizationHeader(headers);
    return this.httpClient.delete<any>(this.baseUrl + '/api/delete-product/' + productCode, {headers});
  }

  productHistory(productCode) {
    let headers = new HttpHeaders();
    headers = this.createAuthorizationHeader(headers);
    return this.httpClient.get<any>(this.baseUrl + '/api/product-history/' + productCode + '/' + this.cryptoParameter, {headers});
  }

  queryTransaction(productCode) {
    let headers = new HttpHeaders();
    headers = this.createAuthorizationHeader(headers);
    return this.httpClient.get<any>(this.baseUrl + '/api/query-transaction/' + productCode, {headers});
  }

  // checkParams() {
  //   console.log('service params: ', this.cryptoParameter);
  // }
  //
  // createProductParams() {
  //   const productDetailsBody = {
  //     productCode : '004',
  //     companyId : 'al',
  //     productBrand : 'al Brand',
  //     productName : 'al Name',
  //     productPrice : 1000000,
  //     productOrigin : 'al Origin',
  //     productReleasedDate : 'al ReleasedDate',
  //     productDescription : 'al Description',
  //     productImageHash : 'al ImageHash',
  //     productImageLink : 'al ImageLin',
  //     keySize : this.cryptoParameter
  //   };
  //
  //   console.log('creating Product');
  //   console.log('productDetailsBody: ', productDetailsBody);
  //
  //   let headers = new HttpHeaders();
  //   headers = headers.append('Authorization', 'Basic ' + btoa('admin:adminpw'));
  //   return this.httpClient.post<any>(this.baseUrl + '/api/create-product/', productDetailsBody, {headers});
  // }
  //
  // deleteProductParams() {
  //   console.log('deleting Product');
  //   console.log('deletedProduct: 004');
  //   const productCode = '004';
  //   let headers = new HttpHeaders();
  //   headers = headers.append('Authorization', 'Basic ' + btoa('admin:adminpw'));
  //   return this.httpClient.delete<any>(this.baseUrl + '/api/delete-product/' + productCode, {headers});
  // }
}
