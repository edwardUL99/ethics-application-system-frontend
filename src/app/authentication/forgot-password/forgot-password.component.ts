import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, throwError } from 'rxjs';
import { AlertComponent } from '../../alert/alert.component';
import { getErrorMessage } from '../../utils';
import { EmailUsernameValidator } from '../../validators';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  /**
   * The form for submitting the forgot password component
   */
  form: FormGroup;
  /**
   * The alert for displaying errors
   */
  @ViewChild('submitError')
  error: AlertComponent;
  /**
   * Indicates if the request has been sent successfully
   */
  requestSent: boolean;

  constructor(private fb: FormBuilder,
    private authService: AuthService) { 
    this.form = this.fb.group({
      username: this.fb.control('', [Validators.required, EmailUsernameValidator()])
    });
  }

  ngOnInit(): void {
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status == 404) {
      return throwError(() => 'Account not found');
    } else {
      return throwError(() => getErrorMessage(error));
    }
  }

  get username() {
    return this.form.get('username');
  }

  displayError(error: any) {
    this.error.displayMessage(error, true);
  }

  submit() {
    const username = this.username.value;
    const email = username.includes('@');
    this.authService.forgotPassword(username, email)
      .pipe(
        catchError(this.handleError)
      )
      .subscribe({
        next: () => this.requestSent = true,
        error: e => this.displayError(e)
      });
  }

  reset() {
    this.requestSent = false;
  }
}
