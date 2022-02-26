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