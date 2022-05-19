import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {UserService} from './user.service';
import {NavController} from '@ionic/angular';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  baseUrl = environment.apiBaseUrl;

  constructor(
        private httpClient: HttpClient,
        private user: UserService,
        private router: NavController
  ) { }

  createAuthorizationHeader(headers: HttpHeaders) {
    return headers.append('Authorization', 'Basic ' + btoa(this.user.getCurrentUser().userid + ':' + this.user.getCurrentUser().password));
  }

  register(user){
    let headers = new HttpHeaders();
    headers = this.createAuthorizationHeader(headers);
    return this.httpClient.post<any>(this.baseUrl + '/api/register-user', user, {headers});
  }

  enroll(user){
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', 'Basic ' + btoa(user.userid + ':' + user.password));
    return this.httpClient.post<any>(this.baseUrl + '/api/enroll-user', {userid: user.userid}, {headers});
  }

  getAllUsers(){
    let headers = new HttpHeaders();
    headers = this.createAuthorizationHeader(headers);
    return this.httpClient.get<any>(this.baseUrl + '/api/users/', {headers});
  }

  getUser(user){
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', 'Basic ' + btoa('admin:adminpw'));
    return this.httpClient.get<any>(this.baseUrl + '/api/users/' + user.userid, {headers});
  }

  isUserEnrolled(userId) {
    let headers = new HttpHeaders();
    headers = this.createAuthorizationHeader(headers);
    return this.httpClient.get<any>(this.baseUrl + '/api/is-user-enrolled/' + userId, {headers});
  }

  logout() {
    this.user.clearCurrentUser();
    localStorage.removeItem('currentUser');
    this.router.navigateBack('/login');
  }
}
