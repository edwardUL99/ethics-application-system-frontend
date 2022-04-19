import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, retry, switchMap, throwError } from 'rxjs';
import { getErrorMessage } from '../utils';
import { ApplicationResponse, ReferredApplicationResponse, SubmittedApplicationResponse } from './models/requests/applicationresponse';
import { CreateDraftApplicationRequest, CreateDraftApplicationResponse, UpdateDraftApplicationRequest, UpdateDraftApplicationResponse } from './models/requests/draftapplicationrequests';
import { SubmitApplicationRequest } from './models/requests/submitapplicationrequest';
import { AcceptResubmittedRequest } from './models/requests/acceptresubmittedrequest';
import { ReviewApplicationRequest, ReviewSubmittedApplicationRequest } from './models/requests/reviewapplicationrequest';
import { ApproveApplicationRequest } from './models/requests/approveapplicationrequest';
import { ReferApplicationRequest } from './models/requests/referapplicationrequest';
import { getResponseMapper, mapAttachedFiles } from './models/requests/mapping/applicationmapper';
import { Application } from './models/applications/application';
import { FinishReviewRequest } from './models/requests/finishreviewrequest';
import { AssignReviewerRequest } from './models/requests/assignreviewerequest';
import { AssignedCommitteeMember } from './models/applications/assignedcommitteemember';
import { AssignMembersResponse } from './models/requests/assignmembersresponse';
import { User } from '../users/user';
import { shortResponseToUserMapper } from '../users/responses/userresponseshortened';
import { BaseResponse } from '../baseresponse';
import { FilesService } from '../files/files.service';
import { UploadFileRequest } from '../files/requests/uploadfilerequest';
import { DownloadedFile, UploadedFile } from '../files/files';
import { UploadFileResponse } from '../files/requests/uploadfileresponse';
import { AttachedFile } from './models/applications/attachedfile';
import { ApplicationStatus } from './models/applications/applicationstatus';
import { PatchAnswersRequest } from './models/requests/patchanswerrequest';
import { UpdateCommentRequest } from './models/requests/updatecommentrequest';

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
  /**
   * Determines if an application is being retrieved in an AnswerRequest context
   */
  answerRequest?: boolean;
}

/**
 * This service provides a gateway to the backend application controller API
 */
@Injectable()
export class ApplicationService {
  constructor(private http: HttpClient, private fileService: FilesService) { }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => getErrorMessage(error));
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
    
    const queryParams = {};

    if (options.id) {
      queryParams['id'] = options.id;
    } else if (options.dbId) {
      queryParams['dbId'] = options.dbId;
    }

    if (options.answerRequest) {
      queryParams['answerRequest'] = true;
    }

    return this.http.get<ApplicationResponse>('/api/applications', {
      params: queryParams
    })
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
              const assignedMember = new AssignedCommitteeMember(assigned.id, assigned.applicationId, shortResponseToUserMapper(assigned.member), assigned.finishReview);

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
    });
  }

  /**
   * A mapper for unassigning committee members
   * @param application the application to map
   * @param response the response to merge into the application
   */
  private unassignMapper(application: Application, response: ApplicationResponse): Observable<Application> {
    return getResponseMapper(response.status).map(response)
      .pipe(
        map(mapped => {
          application.lastUpdated = mapped.lastUpdated;
          application.assignedCommitteeMembers = mapped.assignedCommitteeMembers;

          return application;
        })
      );
  }

  /**
   * Unassign the user from the application
   * @param application the application to unassign the committee member from
   * @param username the username of the committee member
   */
  unassignCommitteeMember(application: Application, username: string): Observable<Application> {
    const assigned = application.assignedCommitteeMembers.filter(a => a.user.username == username).length > 0;

    if (assigned) {
      return this.http.post<ApplicationResponse>(`/api/applications/unassign/${username}?id=${application.applicationId}`, {})
        .pipe(
          catchError(this.handleError),
          switchMap(response => this.unassignMapper(application, response))
        );
    } else {
      return of(application);
    }
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
    return getResponseMapper(response.status).map(response);
  }

  /**
   * Delete the application with the given ID from the server
   * @param id the ID of the application to delete
   * @param admin if true, any application can be deleted
   */
  deleteApplication(id: string, admin: boolean = false): Observable<BaseResponse> {
    const url = (admin) ? '/api/applications/admin/delete' : '/api/applications/delete';

    return this.http.delete(url, {
      params: {
        id: id
      }
    })
    .pipe(
      catchError(this.handleError)
    );
  }

  /**
   * A mapper for mapping upload file response to an application response
   * @param response the response to map
   */
  private mapUploadResponse(application: Application, response: UploadFileResponse): Observable<Application> {
    const uploadedFile: UploadedFile = UploadedFile.fromResponse(response);
    const attachedFile: AttachedFile = new AttachedFile(undefined, uploadedFile.filename, uploadedFile.directory, uploadedFile.username);
    application.attachFile(attachedFile);

    const request = new UpdateDraftApplicationRequest(application.applicationId, application.answers, application.attachedFiles, application.applicationTemplate);
    let updateResponse: Observable<UpdateDraftApplicationResponse>;

    if (application.status == ApplicationStatus.DRAFT) {
      updateResponse = this.updateDraftApplication(request);
    } else if (application.status == ApplicationStatus.REFERRED) {
      updateResponse = this.updateReferredApplication(request);
    } else {
      throw new Error("Application must be in DRAFT or REFERRED state");
    }

    return updateResponse.pipe(
        map(response => {
          application.lastUpdated = new Date(response.lastUpdated);
          application.attachedFiles = mapAttachedFiles(response.attachedFiles);

          return application;
        })
      );
  }

  /**
   * Attach a file to the application
   * @param application the application to attach the file to
   * @param file the file/request
   */
  attachFile(application: Application, file: File | UploadFileRequest): Observable<Application> {
    const applicationId = application.applicationId;
    
    let request: UploadFileRequest;
    
    if (file instanceof File) {
      request = new UploadFileRequest(file.name, file, applicationId);
    } else {
      request = file as UploadFileRequest;
    }
    
    return this.fileService.uploadFile(request)
      .pipe(
        switchMap(response => this.mapUploadResponse(application, response))
      );
  }

  /**
   * Download the given attached file
   * @param file the file to download
   */
  downloadAttachedFile(file: AttachedFile): Observable<DownloadedFile> {
    const filename = file.filename;
    const directory = file.directory;
    const username = file.username;

    return this.fileService.getFile(filename, directory, username);
  }

  /**
   * A mapper for mapping delete file response to updating the application's attached file record
   * @param application the application the file is being deleted from
   * @param file the file being deleted
   */
  private mapDeleteAttachedFile(application: Application, file: AttachedFile): Observable<Application> {
    const attachedFiles = application.attachedFiles;
    const index = attachedFiles.indexOf(file);

    if (index > -1) {
      attachedFiles.splice(index, 1);
    }

    const request = new UpdateDraftApplicationRequest(application.applicationId, application.answers, application.attachedFiles, application.applicationTemplate);
    let updateResponse: Observable<UpdateDraftApplicationResponse>;

    if (application.status == ApplicationStatus.DRAFT) {
      updateResponse = this.updateDraftApplication(request);
    } else if (application.status == ApplicationStatus.REFERRED) {
      updateResponse = this.updateReferredApplication(request);
    } else {
      throw new Error("Application must be in DRAFT or REFERRED state");
    }

    return updateResponse.pipe(
        map(response => {
          application.lastUpdated = new Date(response.lastUpdated);

          return application;
        })
      );
  }

  /**
   * Delete the given attached file
   * @param application the application to delete the file of
   * @param file the file to delete
   */
  deleteAttachedFile(application: Application, file: AttachedFile): Observable<Application> {
    const filename = file.filename;
    const directory = file.directory;
    const username = file.username;

    return this.fileService.deleteFile(filename, directory, username)
      .pipe(
        switchMap(() => this.mapDeleteAttachedFile(application, file))
      );
  }

  /**
   * Patch the answers of the application
   * @param request the request to patch the answers
   */
  patchAnswers(request: PatchAnswersRequest): Observable<ApplicationResponse> {
    return this.http.patch<ApplicationResponse>('/api/applications/answers/', request)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Patch the comment of the application. The comment must have a database ID and be a top-level parent comment
   * @param request the request to patch the comment
   */
  patchComment(request: UpdateCommentRequest): Observable<ApplicationResponse> {
    return this.http.patch<ApplicationResponse>('/api/applications/comment/', request)
      .pipe(
        catchError(this.handleError)
      );
  }
}