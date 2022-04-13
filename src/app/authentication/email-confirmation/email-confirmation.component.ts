import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError as throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationRequest } from '../confirmationrequest';

import { getErrorMessage } from '../../utils';

/**
 * The component used to confirm an email account
 */
@Component({
  selector: 'app-email-confirmation',
  templateUrl: './email-confirmation.component.html',
  styleUrls: ['./email-confirmation.component.css']
})
export class EmailConfirmationComponent implements OnInit {
  /**
   * An error thrown on initialisation
   */
  initError: string;
  /**
   * An error that occurred when confirming the account
   */
  confirmError: string;
  /**
   * A flag to indicate if the form is being used
   */
  useForm: boolean;
  /**
   * The email used to confirm the account
   */
  email: string;
  /**
   * The confirmation token
   */
  token: string;
  /**
   * A form for users to manually enter the confirmation details
   */
  form: FormGroup;

  constructor(private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder) {
      this.form = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        token: ['', Validators.required]
      });
  }

  private initialisationError(error: HttpErrorResponse) {
    const e = getErrorMessage(error);
    return throwError(() => e);
  }

  private confirmationError(error: HttpErrorResponse) {
    const e = getErrorMessage(error);
    return throwError(() => e);
  }

  ngOnInit() {
    this.email = null;
    this.token = null;
    this.initError = null;
    this.confirmError = null;

    this.route.queryParams.subscribe(params => {
      if (params.email) {
        this.email = params.email;
      }

      if (params.token) {
        this.token = params.token;
      }

      this.useForm = !this.email || !this.token;
      const allInfo = this.email != '' && this.token != '';

      if (this.email) {
        this.authService.isConfirmed(this.email, true).pipe(
          retry(3),
          catchError(this.initialisationError)
        )
        .subscribe(r => {
          const confirmed = r.confirmed;

          if (this.useForm && !confirmed && !allInfo) {
            this.syncForms();
          } else if (!confirmed && allInfo) {
            this.confirm();
          } else {
            this.initError = "The user's account is already confirmed";
          }
        },
        e => {
          this.initError = e;
        });
      } else if (this.token) {
        this.syncForms();
      }
    });
  }

  private syncForms() {
    this.form.get('email').setValue((this.email == null) ? '':this.email);
    this.form.get('token').setValue((this.token == null) ? '':this.token);
  }

  confirm() {
    this.initError = null;
    this.confirmError = null;
  
    if (this.useForm) {
      const value = this.form.value;

      if (value.email && value.token) {
        this.email = value.email;
        this.token = value.token
      }
    }

    this.authService.confirmAccount(new ConfirmationRequest(this.email, this.token))
      .pipe(
        retry(3),
        catchError(this.confirmationError)
      )
      .subscribe({
        next: r => {
          if (!r.confirmed) {
            this.confirmError = "Failed to confirm the user";
          } else {
            this.router.navigate(['login'], {
              queryParams: {
                confirmed: true
              }
            });
          }
        },
        error: e => {
          this.confirmError = e;
        }
      });
  }
}
