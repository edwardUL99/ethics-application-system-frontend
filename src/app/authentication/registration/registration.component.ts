import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControlOptions } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../auth.service';
import { RegistrationRequest } from '../registrationrequest';
import { environment } from '../../../environments/environment';
import { AccountResponse } from '../accountresponse';
import { getErrorMessage } from '../../utils';
import { EmailValidator, PasswordConfirmValidator } from '../../validators';

/**
 * This component represents a request to register for an account
 */
@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  /**
   * The form group representing the form
   */
  form: FormGroup;
  /**
   * The group of password matching fields
   */
  passwordGroup: FormGroup;
  /**
   * The confirmation key passed in as query parameter if the user knows it
   */
  confirmationKey: string = null;
  /**
   * If this is true, registration is successful, but the user needs to confirm the account
   */
  registeredNeedsConfirmation: boolean = false;
  /**
   * An error message
   */
  error: string = null;
  /**
   * A tooltip for the email input on registration
   */
  registerTooltip: string = 'Enter your UL e-mail address. Your username after registration will be the part before the @ symbol';

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute) {
      const options: AbstractControlOptions = {validators: PasswordConfirmValidator()};

      this.passwordGroup = this.fb.group({
        password: ['', Validators.required],
          confirmPassword: ['', Validators.required]
        }, options);
      this.form = this.fb.group({
        email: ['', [Validators.required, Validators.email, EmailValidator()]],
        passwordGroup: this.passwordGroup
      });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.confirmationKey = params.confirmationKey;
    });
  }
  
  private handleError(error: HttpErrorResponse) {
    return throwError(() => getErrorMessage(error));
  }

  get email() {
    return this.form.get('email');
  }

  get password() {
    return this.passwordGroup.get('password');
  }

  get confirmPassword() {
    return this.passwordGroup.get('confirmPassword');
  }

  /**
   * This function registers the user 
   */
  register() {
    this.error = null;

    const data = this.form.value;

    if (data.passwordGroup) {
      data['password'] = data.passwordGroup.password;
      data['confirmPassword'] = data.passwordGroup.confirmPassword;
    }

    if (data.email && data.password && data.confirmPassword) {
      const email: string = data.email;

      if (environment.requireULEmail && !email.includes("ul.ie")) {
        this.error = "The e-mail address must be a UL e-mail address";
        return;
      }

      const password: string = data.password;
      const confirmPassword: string = data.confirmPassword;

      if (password === confirmPassword) {
        const username: string = email.substring(0, email.indexOf('@'));
        
        const request: RegistrationRequest = new RegistrationRequest(username, email, password, this.confirmationKey);
        this.authService.register(request)
        .pipe(
          retry(3),
          catchError(this.handleError)
        )
        .subscribe({
          next: x => {
            const response1: AccountResponse = x as AccountResponse;
            this.registeredNeedsConfirmation = !response1.confirmed;
            
            if (!this.registeredNeedsConfirmation) {
              this.router.navigate(['login']);
            }
          }, 
          error: e => this.error = e
        });
      } else {
        this.error = 'The passwords must match';
      }
    }
  }
}
