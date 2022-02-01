import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { AuthenticationRequest } from '../authenticationrequest';
import { throwError as throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { JWTStore } from '../jwtstore';
import { UserService } from '../../users/user.service';
import { UserContext } from '../../users/usercontext';

/**
 * This component represents the component for login
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  /**
   * The form group representing the form
   */
  form: FormGroup;
  /**
   * An error message
   */
  error: string;
  /**
   * A tooltip for the username field on login
   */
  loginTooltip: string = 'You can enter just your username (student ID or first.lastname) or your full e-mail';

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private jwtStore: JWTStore,
    private userService: UserService) { 
      this.form = this.fb.group({
        username: ['', Validators.required],
        password: ['', Validators.required],
        staySignedIn: ['']
      });
    }

  ngOnInit() {
    if (this.jwtStore.isTokenValid()) {
      this.redirectPostLogin(this.jwtStore.getUsername());
    }
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status == 404) {
      return throwError('Account not found');
    }

    return throwError('Something bad happened!');
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
        } else if (e == '404-Account') {
          this.form.reset();
        } else {
          this.error = e; 
        }
      });
  }

  private doLogin(request: AuthenticationRequest) {
    this.authService.authenticate(request)
      .pipe(
        retry(3),
        catchError(this.handleError)
    )
    .subscribe(x => {
      this.jwtStore.storeToken(x.username, x.token, x.expiry);
      this.router.navigate(['user-redirect']);
    },
    e => this.error = e);
  }

  login() {
    this.error = null;
    const val = this.form.value;

    if (val.username && val.password) {
      const username: string = val.username;
      const password: string = val.password;
      const email: boolean = val.username.includes('@');
      const expiry: number = (val.staySignedIn === true) ? 336 : 2; // 2 weeks if stay signed in, else 2 hours

      const request = new AuthenticationRequest(username, password, email, expiry);

      this.authService.isConfirmed(username, email)
        .pipe(
          retry(3),
          catchError(this.handleError)
        )
        .subscribe(x => {
          if (x.confirmed) {
            this.doLogin(request);
          } else {
            this.router.navigate(['needs-confirm'], {
              queryParams: {username: username, email: email}
            });
          }
        },
        e => this.error = e)
    }
  }
}
