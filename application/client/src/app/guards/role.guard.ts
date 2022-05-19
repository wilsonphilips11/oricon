import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import {NavController} from '@ionic/angular';
import {UserService} from '../service/user.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
      private router: NavController,
      private user: UserService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const expectedRole = route.data.role;
    if (expectedRole === this.user.getCurrentUser().role) {
      return true;
    } else if (Array.isArray(expectedRole) && expectedRole.includes(this.user.getCurrentUser().role)) {
      return true;
    } else {
      this.router.navigateRoot(['']);
      return true;
    }
  }
}
