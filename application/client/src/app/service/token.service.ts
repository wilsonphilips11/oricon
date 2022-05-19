import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {UserService} from './user.service';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  baseUrl = environment.apiBaseUrl;

  constructor(
      private httpClient: HttpClient,
      private user: UserService
  ) { }

  createAuthorizationHeader(headers: HttpHeaders) {
    const currentUser = this.user.getCurrentUser();
    return headers.append('Authorization', 'Basic ' + btoa(this.user.currentUser.userid + ':' + this.user.currentUser.password));
  }

  getTokenDetails() {
    let headers = new HttpHeaders();
    headers = this.createAuthorizationHeader(headers);
    return this.httpClient.get<any>(this.baseUrl + '/api/token-detail/', {headers});
  }

  getAllowanceToken() {
    let headers = new HttpHeaders();
    headers = this.createAuthorizationHeader(headers);
    return this.httpClient.get<any>(this.baseUrl + '/api/allowance-token/', {headers});
  }

  transferToken(transferDetailsBody) {
    let headers = new HttpHeaders();
    headers = this.createAuthorizationHeader(headers);
    return this.httpClient.post<any>(this.baseUrl + '/api/transfer-token/', transferDetailsBody, {headers});
  }

  transferFromToken(transferFromDetailsBody) {
    let headers = new HttpHeaders();
    headers = this.createAuthorizationHeader(headers);
    return this.httpClient.post<any>(this.baseUrl + '/api/transfer-from-token/', transferFromDetailsBody, {headers});
  }

  approveToken(approveDetailsBody) {
    let headers = new HttpHeaders();
    headers = this.createAuthorizationHeader(headers);
    return this.httpClient.put<any>(this.baseUrl + '/api/approve-token/', approveDetailsBody, {headers});
  }

  mintToken(mintDetailsBody) {
    let headers = new HttpHeaders();
    headers = this.createAuthorizationHeader(headers);
    return this.httpClient.post<any>(this.baseUrl + '/api/mint-token/', mintDetailsBody, {headers});
  }
}
