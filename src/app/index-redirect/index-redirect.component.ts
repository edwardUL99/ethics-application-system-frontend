import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JWTStore } from '../authentication/jwtstore';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-index-redirect',
  template: '<div></div>'
})
export class IndexRedirectComponent implements OnInit {
  constructor(private router: Router,
    private jwt: JWTStore) {}

  ngOnInit(): void {
    if (this.jwt.getUsername() && this.jwt.isTokenValid()) {
      const expiration = this.jwt.getExpiration();
      const now = new Date();

      if ((expiration.getTime() - now.getTime()) <= environment.login_redirect_token_expiry) {
        this.router.navigate(['login-redirect']);
      } else {
        this.router.navigate(['home'])
      }
    } else {
      this.router.navigate(['login-redirect']);
    }
  }
}
