/**
 * This file defines some validators
 */

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { environment } from '../environments/environment';

/**
 * This function returns a custom validator which validates if the email address is a UL email address
 * if environment.requireULEmail is enabled
 * @returns the custom validator
 */
 export function EmailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const allowed = !environment.requireULEmail || control.value.includes('ul.ie');
      return allowed ? null : {invalidEmail: control.value};
    }
  }