import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(private userService: UserService,
    private router: Router,
    private jwtStore: JWTStore) { }

  ngOnInit() {
    this.error = false;

    if (this.jwtStore.isTokenValid()) {
      this.redirectPostLogin(this.jwtStore.getUsername());
    } else {
      this.router.navigate(['login']);
    }
  }

  private redirectPostLogin(username: string) {
    this.userService.loadUser(username, false)
      .subscribe(response => {
        UserContext.getInstance().user = response;
        this.router.navigate(['home']);
      },
      e => {
        if (e == '404-User') {
          this.router.navigate(['create-user'])
        } else {
          this.error = true;
        } 
      });
  }

}
