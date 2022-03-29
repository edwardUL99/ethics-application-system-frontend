import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, retry, throwError } from 'rxjs';
import { getErrorMessage } from '../utils';

import { SearchResponse } from './searchresponse';
import { SearchEndpoints } from './search-endpoints';

/**
 * This class provides a service for executing searches
 */
@Injectable()
export class SearchService {
  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => getErrorMessage(error));
  }

  /**
   * Search using the provided endpoint and query
   * @param endpoint the endpoint to search
   * @param query the query to search (the search ednpoint must have a query param called 'query')
   * @param or true to specify that the backend must OR multiple criteria or false to AND them
   * @returns an observable with the list of results
   */
  search<T>(endpoint: SearchEndpoints, query: string, or: boolean = false): Observable<SearchResponse<T>> {
    const queryParams = {
      query: query 
    };

    if (or) {
      queryParams['or'] = true
    }

    return this.http.get<SearchResponse<T>>(endpoint, {
      params: queryParams
    })
    .pipe(
      retry(3),
      catchError(this.handleError)
    );
  }
}
