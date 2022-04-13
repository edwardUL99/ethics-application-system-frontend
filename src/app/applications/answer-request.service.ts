import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, mergeMap, Observable, retry, throwError } from 'rxjs';
import { getErrorMessage } from '../utils';

import { AddAnswerRequestResponse, AnswerRequestResponse } from './models/requests/answer-requests/responses';
import { AddAnswerRequest, RespondAnswerRequest } from './models/requests/answer-requests/requests';
import { BaseResponse } from '../baseresponse';
import { AnswerRequest } from './models/applications/answer-requests/answerrequest';
import { mapAnswerRequest } from './models/requests/answer-requests/answerrequestmapping';

/**
 * This class provides services for answer requests
 */
@Injectable()
export class AnswerRequestService {
  constructor(public http: HttpClient) {}

  private handleGeneralError(e: HttpErrorResponse, list: boolean) {
    const base = (list) ? 'Request(s) Not Found.' : 'Request Not Found.';

    if (e.status == 404) {
      return throwError(() => base + ' This could be because the application is no longer in a status that is accepting answers or ' +
      'all of the requested fields no longer exist (full application being filled out instead of expedited, for instance)');
    } else {
      return throwError(() => getErrorMessage(e));
    }
  }

  /**
   * Retrieve all the answer requests for the given user
   * @param username the username of the user to retrieve the requests for
   */
  getRequests(username: string): Observable<AnswerRequestResponse[]> {
    return this.http.get<AnswerRequestResponse[]>('/api/applications/answers/requests', {
      params: {
        'username': username
      }
    })
    .pipe(
      retry(3),
      catchError(e => this.handleGeneralError(e, true))
    );
  }

  /**
   * Request the single request identified by the given id
   * @param id the ID of the request to retrieve
   */
  getRequest(id: number): Observable<AnswerRequest> {
    return this.http.get<AnswerRequestResponse>('/api/applications/answers/request', {
      params: {
        'id': id
      }
    })
    .pipe(
      retry(3),
      catchError(e => this.handleGeneralError(e, false)),
      mergeMap(response => mapAnswerRequest(response))
    );
  }

  /**
   * Request that an answer request is added to the system
   * @param request the request to send
   */
  createRequest(request: AddAnswerRequest): Observable<AddAnswerRequestResponse> {
    return this.http.post<AddAnswerRequestResponse>('/api/applications/answers/request/', request)
    .pipe(
      catchError(e => this.handleGeneralError(e, false))
    );
  }

  /**
   * Submit the answers to the application and delete the request as it is completed
   * @param request the request to send
   */
  submitAnswers(request: RespondAnswerRequest): Observable<BaseResponse> {
    return this.http.post<BaseResponse>('/api/applications/answers/answer/', request)
    .pipe(
      catchError(e => this.handleGeneralError(e, false))
    )
  }
}