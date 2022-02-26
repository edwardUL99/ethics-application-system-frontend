import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JWTStore } from '../../authentication/jwtstore';
import { UserService } from '../user.service';
import { UserContext } from '../usercontext';

@Component({
  selector: 'app-user-redirect',
  templateUrl: './user-redirect.component.html',
  styleUrls: ['./user-redirect.component.css']
})
export class UserRedirectComponent implements OnInit {
  /**
   * An error condition occurred
   */
  error: boolean;
  /**
   * A return url to redirect to
   */
  returnUrl: string;

  constructor(private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private jwtStore: JWTStore,
    private userContext: UserContext) { }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'];
    this.error = false;

    if (this.jwtStore.isTokenValid()) {
      this.redirectPostLogin(this.jwtStore.getUsername());
    } else {
      this.router.navigate(['logout'], {
        queryParams: {
          sessionTimeout: true
        }
      });
    }
  }

  private redirectPostLogin(username: string) {
    this.userService.loadUser(username, false)
      .subscribe({
        next: response => {
          this.userContext.setUser(response);
          
          if (this.returnUrl) {
            this.router.navigateByUrl(this.returnUrl);
          } else {
            this.router.navigate(['home']);
          }
        },
        error: e => {
          if (e == '404-User') {
            this.router.navigate(['create-user'])
          } else {
            this.error = true;
          } 
        }
      });
  }

}
