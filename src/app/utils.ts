import { HttpErrorResponse } from '@angular/common/http';
import { EventEmitter } from '@angular/core';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { AlertComponent } from './alert/alert.component';
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
    return 'You are no longer authorized, so you will have to login again';
  } else if (error.status == 404) {
    return 'Not Found';
  } else if (error.status >= 300 && error.status <= 500) {
    return 'An unknown server error occurred, please try again later';
  } else {
    return 'Failed to reach the server. Are you connected to the internet?';
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
      return (ErrorMappings[json.error]) ? ErrorMappings[json.error] : json.error;
    }
  }

  return 'An unknown error occurred, please try again later';
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

  if (sources.length > 0) {
    return forkJoin(sources as Observable<T>[]);
  } else {
    return new Observable<T[]>(observer => {
      observer.next([]);
      observer.complete();
    });
  }
}

/**
 * Replace all \\n characters in str with \n
 * @param str the string to replace \n
 */
export function replaceNewLines(str: string): string {
  if (str && str != null) {
    return str.replace(/\\n/g, '\n');
  } else {
    return str;
  }
}

/**
 * A class that allows the tracking of subscriptions to event emitters and then destroy all the subscriptions
 * @param T the type emitted
 */
export class TrackedEventEmitter<T> extends EventEmitter<T> {
  /**
   * List of question change subscriptions
   */
  private subscriptions: Subscription[];

  constructor() {
    super();
    this.subscriptions = [];
  }

  /**
   * Registers the callback by subscribing to the emitter with the emitted event being passed into the callback
   * @param callback the callback to register
   */
  register(callback: (e: T) => void) {
    this.subscriptions.push(this.subscribe(callback));
  }

  /**
   * Destroy all subscriptions to this event emitter
   */
  destroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions.splice(0);
  }
}

/**
 * Create an ISO timestamp of the current date
 * @param date the date to convert
 * @returns an ISO timestamp
 */
export function createTimestamp(date: Date): string {
  const dateStr = date.toLocaleString('sv');
  return dateStr.replace(/\s/, 'T')
}