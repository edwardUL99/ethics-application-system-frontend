import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { AuthenticationRequest } from '../authenticationrequest';
import { throwError as throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { JWTStore } from '../jwtstore';
import { UserService } from '../../users/user.service';
import { UserContext } from '../../users/usercontext';
import { environment } from '../../../environments/environment';
import { getErrorMessage, extractMappedError } from '../../utils';
import { ErrorMappings } from '../../mappings';
import { EmailValidator } from '../../validators';

/*
CUSTOM VALIDATORS
*/

function EmailUsernameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (value == null) {
      return null;
    }

    if (value.includes('@')) {
      const result = Validators.email(control);

      if (result != null) {
        return {username: 'If using e-mail as the username, it needs to be a valid email'}
      } else {
        const ulResult = environment.requireULEmail ? EmailValidator()(control):null;

        if (ulResult != null) {
          return {username: 'The e-mail address must be a UL e-mail'};
        }
      }
    } else {
      if (value.length > 128) {
        return {username: 'The username value entered cannot exceed 128 characters'};
      }
    }

    return null;
  }
}

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
        username: ['', [Validators.required, EmailUsernameValidator()]],
        password: ['', Validators.required],
        staySignedIn: ['']
      });
    }

  ngOnInit() {
    if (this.jwtStore.isTokenValid()) {
      this.redirectPostLogin(this.jwtStore.getUsername());
    }
  }

  get username() {
    return this.form.get('username');
  }

  get password() {
    return this.form.get('password');
  }

  get staySignedIn() {
    return this.form.get('staySignedIn');
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status == 404) {
      return throwError(() => 'Account not found');
    } else if (error.status == 400) {
      return throwError(() => extractMappedError(error));
    }

    return throwError(() => getErrorMessage(error));
  }

  private redirectPostLogin(username: string) {
    this.userService.loadUser(username, false)
      .subscribe({
        next: response => {
          UserContext.getInstance().user = response;
          this.router.navigate(['home']);
        },
        error: e => {
          if (e == '404-User') {
            this.router.navigate(['create-user'])
          } else if (e == '404-Account') {
            this.error = 'Account not found';
            this.form.reset();
          } else {
            this.error = e; 
          }
        }
      });
  }

  private doLogin(request: AuthenticationRequest) {
    this.authService.authenticate(request)
      .pipe(
        catchError(this.handleError)
    )
    .subscribe({
      next: x => {
        this.jwtStore.storeToken(x.username, x.token, x.expiry);
        this.router.navigate(['user-redirect']);
      },
      error: e => {
        if (e == ErrorMappings.account_not_confirmed) {
          this.router.navigate(['needs-confirm'], {
            queryParams: {username: request.username, email: request.email}
          });
        } else {
          this.error = e;
        }
      }
    });
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

      this.doLogin(request);
    }
  }
}
