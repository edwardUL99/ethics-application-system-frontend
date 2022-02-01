import { HttpErrorResponse } from '@angular/common/http';

/**
 * File providing utility functions
*/

/**
 * A utility function for getting a generic error message based on the error response status code
 * @param error the http error
 * @returns the error message from the http error
 */
export function getErrorMessage(error: HttpErrorResponse) {
    if (error.status >= 300 && error.status < 500) {
        return 'An unknown error occurred, please try again later';
    } else {
        return 'A server error occurred. Are you connected to the internet?';
    }
}