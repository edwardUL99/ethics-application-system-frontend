import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, retry, throwError } from 'rxjs';
import { getErrorMessage } from '../utils';
import { ApplicationResponse, ReferredApplicationResponse, SubmittedApplicationResponse } from './models/requests/applicationresponse';
import { CreateDraftApplicationRequest, CreateDraftApplicationResponse, UpdateDraftApplicationRequest, UpdateDraftApplicationResponse } from './models/requests/draftapplicationrequests';
import { GenerateIDResponse } from './models/requests/generateidresponse';
import { SubmitApplicationRequest } from './models/requests/submitapplicationrequest';
import { AcceptResubmittedRequest } from './models/requests/acceptresubmittedrequest';
import { ReviewApplicationRequest, ReviewSubmittedApplicationRequest } from './models/requests/reviewapplicationrequest';
import { ApproveApplicationRequest } from './models/requests/approveapplicationrequest';
import { ReferApplicationRequest } from './models/requests/referapplicationrequest';
import { getResponseMapper } from './models/requests/mapping/applicationmapper';
import { Application } from './models/applications/application';
import { FinishReviewRequest } from './models/requests/finishreviewrequest';
import { AssignReviewerRequest } from './models/requests/assignreviewerequest';
import { AssignedCommitteeMember } from './models/applications/assignedcommitteemember';
import { AssignMembersResponse } from './models/requests/assignmembersresponse';
import { User } from '../users/user';
import { shortResponseToUserMapper } from '../users/responses/userresponseshortened';
import { ApplicationStatus } from './models/applications/applicationstatus';

/**
 * This interface represents options for getting an application
 */
export interface GetOptions {
  /**
   * The application ID
   */
  id?: string;
  /**
   * The database ID of the application
   */
  dbId?: number;
}

/**
 * This service provides a gateway to the backend application controller API
 */
@Injectable()
export class ApplicationService {
  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => getErrorMessage(error));
  }

  /**
   * Requests to the server to generate an Application ID and returns the observable that will resolve
   * the request
   */
  generateId(): Observable<GenerateIDResponse> {
    return this.http.get<GenerateIDResponse>('/api/applications/id/')
      .pipe(
        retry(3),
        catchError(this.handleError)
      );
  }

  /**
   * Retrieve an application either by its ethics ID or database ID
   * @param options the options to get the application with. Either id or dbId must be provided but not both
   */
  getApplication(options: GetOptions): Observable<ApplicationResponse> {
    if (options.id && options.dbId) {
      throw new Error('Cannot give both id and dbId in GetOptions')
    } else if (!options.id && !options.dbId) {
      throw new Error('You must provide one of id or dbId');
    }

    const url = (options.id) ? `/api/applications?id=${options.id}` : `/api/applications?dbId=${options.dbId}`;
    
    return this.http.get<ApplicationResponse>(url)
      .pipe(
        retry(3),
        catchError(this.handleError)
      );
  }

  /**
   * Retrieve the list of applications either viewable by the authenticated user or assigned to them
   * @param viewable true to retrieve applications that can be viewed by the authenticated user, false to get assigned applications to the user
   */
  getUserApplications(viewable: boolean = true): Observable<ApplicationResponse[]> {
    return this.http.get<ApplicationResponse[]>(`/api/applications/user?viewable=${viewable}`)
      .pipe(
        retry(3),
        catchError(this.handleError)
      );
  }

  /**
   * Request that the draft application is created
   * @param request the request object to send to the server
   */
  createDraftApplication(request: CreateDraftApplicationRequest): Observable<CreateDraftApplicationResponse> {
    return this.http.post<CreateDraftApplicationResponse>('/api/applications/draft/', request)
      .pipe(
        retry(3),
        catchError(this.handleError)
      );
  }

  /**
   * Request that the draft application is updated
   * @param request the request object to send to the server
   */
  updateDraftApplication(request: UpdateDraftApplicationRequest): Observable<UpdateDraftApplicationResponse> {
    return this.http.put<UpdateDraftApplicationResponse>('/api/applications/draft/', request)
      .pipe(
        retry(3),
        catchError(this.handleError)
      );
  }

  /**
   * Request that the referred application is updated
   * @param request the request object to send to the server
   */
  updateReferredApplication(request: UpdateDraftApplicationRequest): Observable<UpdateDraftApplicationResponse> {
    return this.http.put<UpdateDraftApplicationResponse>('/api/applications/referred/', request)
      .pipe(
        retry(3),
        catchError(this.handleError)
      );
  }

  /**
   * Request that the application with a given application ID gets submitted
   * @param request the request to send to the server
   */
  submitApplication(request: SubmitApplicationRequest): Observable<SubmittedApplicationResponse> {
    return this.http.post<SubmittedApplicationResponse>('/api/applications/submit/', request)
      .pipe(
        retry(3),
        catchError(this.handleError)
      );
  }

  /**
   * Request that a resubmitted application be accepted by the committee and assign committee members to it
   * @param request the request to send to the server
   */
  acceptResubmitted(request: AcceptResubmittedRequest): Observable<SubmittedApplicationResponse> {
    return this.http.post<SubmittedApplicationResponse>('/api/applications/resubmit/', request)
      .pipe(
        retry(3),
        catchError(this.handleError)
      );
  }

  /**
   * Check if the partial assigned member from the response is in the list of assigned committee members already
   * @param assigned the list of already assigned committee members
   * @param partial the partial (containing a partial user) assigned member to check
   */
  private containsAssignedMember(assigned: AssignedCommitteeMember[], partial: AssignedCommitteeMember): boolean {
    const partialUserEquals = (u: User, u1: User): boolean => {
      return u.username == u1.username;
    }
    
    for (let member of assigned) {
      if (member.id == partial.id && partialUserEquals(member.user, partial.user) && member.finishReview == partial.finishReview) {
        return true;
      }
    }

    return false;
  }

  /**
   * Assign the committee members to the application
   * @param application the application to assign the committee members to
   * @param members the committee members to assign to the application
   */
  assignCommitteeMembers(application: Application, members: string[]): Observable<AssignMembersResponse> {
    return new Observable<AssignMembersResponse>(observer => {
      const request = new AssignReviewerRequest(application.applicationId, members);

      this.http.post<AssignMembersResponse>('/api/applications/assign/', request)
        .pipe(
          retry(3),
          catchError(this.handleError)
        )
        .subscribe({
          next: response => {
            const applicationAssigned = application.assignedCommitteeMembers;
            
            response.members.forEach(assigned => {
              const assignedMember = new AssignedCommitteeMember(assigned.id, shortResponseToUserMapper(assigned.member), assigned.finishReview);

              if (!this.containsAssignedMember(applicationAssigned, assignedMember)) {
                applicationAssigned.push(assignedMember);
              }
            });

            application.lastUpdated = new Date(response.lastUpdated);

            observer.next(response);
            observer.complete();
          },
          error: e => {
            observer.error(e);
            observer.complete();
          }
        })
    })
  }

  /**
   * Mark the application as in review/reviewed
   * @param request the request to send to the server
   */
  markReview(request: ReviewApplicationRequest): Observable<SubmittedApplicationResponse> {
    return this.http.post<SubmittedApplicationResponse>('/api/applications/review/', request)
      .pipe(
        retry(3),
        catchError(this.handleError)
      );
  }

  /**
   * Mark the given committee member as finished their review
   * @param application the application being updated
   * @param member the username of the committee member
   */
  finishMemberReview(application: Application, member: string): Observable<SubmittedApplicationResponse> {
    return new Observable<SubmittedApplicationResponse>(observer => {
      this.http.post<SubmittedApplicationResponse>('/api/applications/review/finish/', new FinishReviewRequest(application.applicationId, member))
        .pipe(
          retry(3),
          catchError(this.handleError)
        )
        .subscribe({
          next: response => {
            const assigned = response.assignedCommitteeMembers.filter(e => e.username == member)[0];

            if (assigned) {
              application.assignedCommitteeMembers.forEach(a => {
                if (a.user.username == member) {
                  a.finishReview = assigned.finishReview;
                }
              });
            }

            application.lastUpdated = new Date(response.lastUpdated);

            observer.next(response);
            observer.complete();
          },
          error: e => {
            observer.error(e);
            observer.complete();
          }
        })
    });
  }

  /**
   * Update the application that is currently being reviewed
   * @param request the request to send to the server
   */
  updateReview(request: ReviewSubmittedApplicationRequest): Observable<SubmittedApplicationResponse> {
    return this.http.put<SubmittedApplicationResponse>('/api/applications/review/', request)
      .pipe(
        retry(3),
        catchError(this.handleError)
      );
  }

  /**
   * Approve/reject the specified application
   * @param request the request to send to the server
   */
  approveApplication(request: ApproveApplicationRequest): Observable<SubmittedApplicationResponse> {
    return this.http.post<SubmittedApplicationResponse>('/api/applications/approve/', request)
      .pipe(
        retry(3),
        catchError(this.handleError)
      );
  }

  /**
   * Refer the application back to the applicant
   * @param request the request to send to the server
   * @returns the observable containing the response
   */
  referApplication(request: ReferApplicationRequest): Observable<ReferredApplicationResponse> {
    return this.http.post<ReferredApplicationResponse>('/api/applications/refer/', request)
      .pipe(
        retry(3),
        catchError(this.handleError)
      );
  }

  /**
   * Map the response to the application object using the mappers defined in requests/mapping/applicationmapper.ts
   * @param response the response to map
   */
  mapApplicationResponse(response: ApplicationResponse): Observable<Application> {
    return getResponseMapper(ApplicationStatus[response.status]).map(response);
  }
}