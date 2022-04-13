import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { JWTStore } from './jwtstore';

/**
 * This class validates that the user is authenticated and redirects to login if not
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private jwt: JWTStore) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.jwt.getUsername() && this.jwt.isTokenValid()) {
      return true;
    } else {
      this.router.navigate(['logout'], {queryParams: { returnUrl: state.url, sessionTimeout: true}});
      return false;
    }
  }
}