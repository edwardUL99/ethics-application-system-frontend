import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { _throw as throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../auth.service';
import { RegistrationRequest } from '../registrationrequest';
import { environment } from '../../../environments/environment';
import { AccountResponse } from '../accountresponse';

function EmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const allowed = !environment.requireULEmail || control.value.includes('ul.ie');
    return allowed ? null : {invalidEmail: control.value};
  }
}

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
   * The confirmation key passed in as query parameter if the user knows it
   */
  private confirmationKey: string = null;
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
  
  disable: boolean = true;

  formsValidity = {
    email: {valid: true, message: ''},
    password: {valid: true, message: ''},
    confirmPassword: {valid: true, message: ''}
  }

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute) {
      this.form = this.fb.group({
        email: ['', [Validators.required, Validators.email, EmailValidator()]],
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required]
      });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.confirmationKey = params.confirmationKey;
    });

    this.form.valueChanges.subscribe(() => this.testInput());
  }
  
  private handleError(error: HttpErrorResponse) {
    return throwError('Something bad happened!');
  }

  private testInput() {
    let valid = true;
    const email = this.form.get('email');

    if (email.errors) {
      console.log(email.errors);
      this.formsValidity.email.valid = false;
      valid = false;

      if (email.errors['required']) {
        this.formsValidity.email.message = 'E-mail is required';
      } else if (email.errors['email']) {
        this.formsValidity.email.message = 'Invalid e-mail';
      } else if (email.errors['invalidEmail']) {
        this.formsValidity.email.message = 'The e-mail needs to be a UL e-mail';
      }
    } else {
      this.formsValidity.email.message = '';
      this.formsValidity.email.valid = true;
    }

    console.log(this.formsValidity)
    this.disable = !valid;
  }

  /**
   * This function registers the user 
   */
  register() {
    this.error = null;

    const data = this.form.value;

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
        .subscribe(x => {
          const response1: AccountResponse = x as AccountResponse;
          this.registeredNeedsConfirmation = !response1.confirmed;
          
          if (!this.registeredNeedsConfirmation) {
            this.router.navigate(['login']);
          }
        }, e => this.error = e);
      } else {
        this.error = 'The passwords must match';
      }
    }
  }
}
