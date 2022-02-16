import { HttpErrorResponse, HttpResponseBase } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
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
    } else if (error.status == 401) {
        return 'You are no longer authorized, so you will have to login again'
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

/**
 * Replace spaces in the string with _, remove punctuation and make all letters
 * lowercase
 */
export function mergeSpaces(str: string) {
    str = str.replace('/[^\w\s]|_/g', "")
        .replace('/\s+/g', " ");
    
    for (let value of str.split(' ')) {
        this.name += value.toLowerCase() + '_';
    }

    return str.substring(0, this.name.length - 1);
}

/**
 * Takes a list of observable or simple types and executes them in parallel returning the result as a list of the resolved observables which is
 * passed to the subscriber function that waits for the returned array
 * 
 * If the array is of a normal type, the following should be done:
 * function createObservable(value: string) {
 *  return of(value).delay(1000);
 * }
 * 
 * const values = ['value1', 'value2', 'value3', 'value4']
 * 
 * You can do as follows:
 * const observables = values.map(v => createObservable(v));
 * joinAndWait(observables).subscribe(v => console.log(v));
 * 
 * or else:
 * joinAndWait(values, vals => vals.map(v => createObservable(v))).subscribe(v => console.log(v));
 * 
 * @param sources the sources to pass into the forkJoin, If it is not a list of Observables, it must be passed in with a sourcesMapper to map 
 * the list of simple values to a list of observable
 * @param sourcesMapper the mapper to map the sources array to a list of observables if they are not already observables
 * @returns the observable that takes the result of the sources as a resolved list of type T`
 */
export function joinAndWait<T>(sources: Observable<T>[] | T[], sourcesMapper?: (v: any[]) => Observable<any>[]): Observable<T[]> {
    if (sourcesMapper) {
        sources = sourcesMapper(sources);
    }

    return forkJoin(sources as Observable<T>[]);
}
