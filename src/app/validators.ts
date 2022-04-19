/**
 * This file defines some validators
 */

import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { environment } from '../environments/environment';

/**
 * This function returns a custom validator which validates if the email address is a UL email address
 * if environment.requireULEmail is enabled
 * @returns the custom validator
 */
export function EmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    let allowed: boolean = true;

    if (environment.requireULEmail) {
      const split = value.split('@');

      if (split.length < 2) {
        return {email: true};
      } else {
        allowed = split[1].includes('ul.ie');
      }
    }

    return allowed ? null : {invalidEmail: control.value};
  }
}

/**
 * Validates the password and confirm password fields for validity. The control must be a form group containing
 * controls with names password and confirmPassword
 * @returns the validator function
 */
export function PasswordConfirmValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password.valid && confirmPassword.valid) {
      if (password.value != confirmPassword.value) {
        return {noMatch: true};
      } else {
        return null;
      }
    } else {
      return {noMatch: true};
    }
  }
}

/**
 * Validates that if an email is used as username, that it is valid
 * @returns the valdator function
 */
export function EmailUsernameValidator(): ValidatorFn {
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
 * Custom required validator as Validators.required doesn't work for checkbox type questions
 */
 export function CheckboxGroupRequired(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!(control instanceof FormGroup)) {
      return null;
    } else {
      for (let key of Object.keys(control.controls)) {
        const checkbox = control.controls[key];

        if (checkbox.value != undefined && checkbox.value != '') {
          return null;
        }
      }
      
      return {required: true};
    }
  }
}
