import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AlertComponent } from '../../alert/alert.component';
import { getErrorMessage } from '../../utils';
import { PasswordConfirmValidator } from '../../validators';
import { AuthService } from '../auth.service';
import { ResetPasswordRequest } from '../resetpasswordrequest';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  /**
   * The form to fill in the new password
   */
  form: FormGroup;
  /**
   * An error loading the component
   */
  loadError: string;
  /**
   * An error message
   */
  @ViewChild('submitError')
  error: AlertComponent;
  /**
   * The username of the account the password is being reset for
   */
  username: string;
  /**
   * The reset token
   */
  token: string;

  constructor(private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService) { 
    const validators: AbstractControlOptions = {validators: PasswordConfirmValidator()};

    this.form = this.fb.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, validators);
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status == 404) {
      return throwError(() => 'Account not found');
    } else {
      return throwError(() => getErrorMessage(error));
    }
  }

  get password() {
    return this.form.get('password');
  }

  get confirmPassword() {
    return this.form.get('confirmPassword');
  }

  ngOnInit(): void {
    this.username = this.route.snapshot.queryParams['username'];

    if (!this.username) {
      this.loadError = 'You need to provide a username with the URL';
    } else {
      this.token = this.route.snapshot.queryParams['token'];

      if (!this.token) {
        this.loadError = 'You need to provide the password reset token with the URL';
      }
    }
  }

  displayError(error: any) {
    this.error.displayMessage(error, true);
  }

  submit() {
    const request = new ResetPasswordRequest(this.username, this.token, this.password.value);

    return this.authService.resetPassword(request)
      .pipe(
        catchError(this.handleError)
      )
      .subscribe({
        next: () => this.router.navigate(['logout'], {
          queryParams: {
            reset: true
          }
        }),
        error: e => this.displayError(e)
      });
  }
}
