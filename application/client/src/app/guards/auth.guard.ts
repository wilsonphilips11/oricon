import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import {NavController} from '@ionic/angular';
import {UserService} from '../service/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
      private router: NavController,
      private user: UserService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    console.log('this.user.getCurrentUser()', this.user.getCurrentUser());
    if (this.user.getCurrentUser()) {
      return true;
    }
    this.router.navigateRoot(['/login']);
    return true;
  }
}
