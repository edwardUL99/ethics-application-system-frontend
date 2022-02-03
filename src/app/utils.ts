import { HttpErrorResponse, HttpResponseBase } from '@angular/common/http';
import { ErrorMappings } from './mappings';

/**
 * File providing utility functions
*/

/**
 * A utility function for getting a generic error message based on the error response status code
 * @param error the http error
 * @returns the error message from the http error
 */
export function getErrorMessage(error: HttpErrorResponse) {
    if (error.status == 400) {
        return extractMappedError(error);
    } else if (error.status >= 300 && error.status < 500) {
        return 'An unknown error occurred, please try again later';
    } else {
        return 'A server error occurred. Are you connected to the internet?';
    }
}

/**
 * Checks if the given error contains a body and a message that can be mapped by a mapped error message,
 * else, the raw error or null is returned.
 * @param error the error response
 */
export function extractMappedError(error: HttpErrorResponse) {
    if (error.status == 400) {
        let json = error.error;

        if (json.error) {
            return (ErrorMappings[json.error]) ? ErrorMappings[json.error]:json.error;
        }
    }

    return 'An unknown error occurred, please try again later';
}