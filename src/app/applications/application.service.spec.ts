import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ApplicationService } from './application.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GenerateIDResponse } from './models/requests/generateidresponse';
import { APPLICATION_ID, createApplicationTemplate, createDraftApplicationResponse, createReferredApplicationResponse, createSubmittedApplication, createSubmittedApplicationResponse, USERNAME } from '../testing/fakes';
import { getErrorMessage } from '../utils';
import { ApplicationResponse, DraftApplicationResponse, ReferredApplicationResponse, SubmittedApplicationResponse } from './models/requests/applicationresponse';
import { ErrorMappings, MessageMappings } from '../mappings';
import { ApplicationStatus } from './models/applications/applicationstatus';
import { SubmitApplicationRequest } from './models/requests/submitapplicationrequest';
import { CreateDraftApplicationRequest, CreateDraftApplicationResponse, UpdateDraftApplicationRequest } from './models/requests/draftapplicationrequests';
import { BaseResponse } from '../baseresponse';
import { AcceptResubmittedRequest } from './models/requests/acceptresubmittedrequest';
import { ReviewApplicationRequest, ReviewSubmittedApplicationRequest } from './models/requests/reviewapplicationrequest';
import { ApproveApplicationRequest } from './models/requests/approveapplicationrequest';
import { ReferApplicationRequest } from './models/requests/referapplicationrequest';
import { Comment } from './models/applications/comment';
import { MapApplicationResponse, ResponseMapperKeys, ApplicationResponseMapper } from './models/requests/mapping/applicationmapper';
import { Application } from './models/applications/application';

/**
 * A test mapper to return fake values
 */
@MapApplicationResponse(ResponseMapperKeys.SUBMITTED)
class TestResponseMapper implements ApplicationResponseMapper {
  map(response: ApplicationResponse): Observable<Application> {
    console.log(response);
    return new Observable<Application>(observable => {
      observable.next(createSubmittedApplication(ApplicationStatus.SUBMITTED));
    });
  }
}

describe('ApplicationService', () => {
  let service: ApplicationService;
  let httpGetSpy: jasmine.Spy;
  let httpPostSpy: jasmine.Spy;
  let httpPutSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        ApplicationService
      ]
    });
    service = TestBed.inject(ApplicationService);

    const httpClient = TestBed.inject(HttpClient);
    httpGetSpy = spyOn(httpClient, 'get');
    httpPostSpy = spyOn(httpClient, 'post');
    httpPutSpy = spyOn(httpClient, 'put');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#generateId should successfully generate application ID', (done) => {
    const expectedResponse: GenerateIDResponse = {
      id: APPLICATION_ID
    };

    httpGetSpy.and.returnValue(new Observable<GenerateIDResponse>(observable => {
      observable.next(expectedResponse);
    }));

    service.generateId().subscribe(value => {
      expect(value).toBeTruthy();
      expect(value).toEqual(expectedResponse);
      expect(httpGetSpy).toHaveBeenCalledWith('/api/applications/id/');
      done();
    });
  });

  it('#generateId should successfully handle error', (done) => {
    const error: HttpErrorResponse = new HttpErrorResponse({
      status: 401
    });

    httpGetSpy.and.returnValue(new Observable<GenerateIDResponse>(observable => {
      observable.error(error);
    }));

    service.generateId().subscribe({
      error: e => {
        expect(e).toEqual(getErrorMessage(error));
        expect(httpGetSpy).toHaveBeenCalledWith('/api/applications/id/');
        done();
      }
    });
  });

  it('#getApplication should successfully retrieve application', (done) => {
    const expectedResponse: DraftApplicationResponse = createDraftApplicationResponse();

    httpGetSpy.and.returnValue(new Observable<ApplicationResponse>(observable => {
      observable.next(expectedResponse);
    }));

    service.getApplication({id: APPLICATION_ID}).subscribe(value => {
      expect(value).toBeTruthy();
      expect(value).toEqual(expectedResponse);
      expect(httpGetSpy).toHaveBeenCalledWith(`/api/applications?id=${APPLICATION_ID}`);
      done();
    });
  });

  it('#getApplication should successfully retrieve application by dbId', (done) => {
    const expectedResponse: DraftApplicationResponse = createDraftApplicationResponse();

    httpGetSpy.and.returnValue(new Observable<ApplicationResponse>(observable => {
      observable.next(expectedResponse);
    }));

    service.getApplication({dbId: 1}).subscribe(value => {
      expect(value).toBeTruthy();
      expect(value).toEqual(expectedResponse);
      expect(httpGetSpy).toHaveBeenCalledWith('/api/applications?dbId=1');
      done();
    });
  });

  it('#getApplication should throw error if both id and dbId are given or neither', () => {
    expect(() => service.getApplication({id: APPLICATION_ID, dbId: 1})).toThrowError('Cannot give both id and dbId in GetOptions');
    expect(() => service.getApplication({})).toThrowError('You must provide one of id or dbId');
    expect(httpGetSpy).not.toHaveBeenCalled();
  });

  it('#getApplication should handle error', (done) => {
    const error: HttpErrorResponse = new HttpErrorResponse({
      error: {error: 'insufficient_permissions'}, status: 400
    });

    httpGetSpy.and.returnValue(new Observable<ApplicationResponse>(observable => {
      observable.error(error);
    }));

    service.getApplication({id: APPLICATION_ID}).subscribe({
      error: e => {
        expect(e).toEqual(ErrorMappings.insufficient_permissions);
        expect(httpGetSpy).toHaveBeenCalledWith(`/api/applications?id=${APPLICATION_ID}`);
        done();
      }
    });
  });

  it('#getUserApplications should get all the users applications successfully', (done) => {
    const expectedResponse: ApplicationResponse[] = [createDraftApplicationResponse()];

    httpGetSpy.and.returnValue(new Observable<ApplicationResponse[]>(observable => {
      observable.next(expectedResponse);
    }));

    service.getUserApplications(true).subscribe(value => {
      expect(value).toBeTruthy();
      expect(value).toEqual(expectedResponse);
      expect(httpGetSpy).toHaveBeenCalledWith('/api/applications/user?viewable=true');
      done();
    });
  });

  it('#getUserApplications should get all the users asisgned applications', (done) => {
    const response = createSubmittedApplicationResponse(ApplicationStatus.SUBMITTED);
    response.assignedCommitteeMembers.push(USERNAME);
    const expectedResponse: ApplicationResponse[] = [response];

    httpGetSpy.and.returnValue(new Observable<ApplicationResponse[]>(observable => {
      observable.next(expectedResponse);
    }));

    service.getUserApplications(false).subscribe(value => {
      expect(value).toBeTruthy();
      expect(value).toEqual(expectedResponse);
      expect(httpGetSpy).toHaveBeenCalledWith('/api/applications/user?viewable=false');
      done();
    });
  });

  it('#getUserApplications should handle errors if thrown', (done) => {
    const error: HttpErrorResponse = new HttpErrorResponse({
      error: {error: 'insufficient_permissions'}, status: 400
    });

    httpGetSpy.and.returnValue(new Observable<ApplicationResponse>(observable => {
      observable.error(error);
    }));

    service.getUserApplications(false).subscribe({
      error: e => {
        expect(e).toEqual(ErrorMappings.insufficient_permissions);
        expect(httpGetSpy).toHaveBeenCalledWith('/api/applications/user?viewable=false');
        done();
      }
    });
  });

  const createDraftRequest = () => {
    return new CreateDraftApplicationRequest(USERNAME, createApplicationTemplate(), APPLICATION_ID, {});
  }

  it('#createDraftApplication should create draft successfully', (done) => {
    const request = createDraftRequest();
    const response: CreateDraftApplicationResponse = {
      dbId: 1,
      id: APPLICATION_ID,
      username: USERNAME,
      status: ApplicationStatus.DRAFT,
      templateId: request.applicationTemplate.databaseId,
      createdAt: new Date().toISOString()
    };

    httpPostSpy.and.returnValue(new Observable<CreateDraftApplicationResponse>(observable => {
      observable.next(response);
    }));

    service.createDraftApplication(request).subscribe(value => {
      expect(value).toBeTruthy();
      expect(value).toEqual(response);
      expect(httpPostSpy).toHaveBeenCalledWith('/api/applications/draft/', request);
      done();
    });
  });

  it('#createDraftApplication should handle error successfully', (done) => {
    const request = createDraftRequest();
    const error: HttpErrorResponse = new HttpErrorResponse({
      error: {error: 'application_already_exists'}, status: 400
    });

    httpPostSpy.and.returnValue(new Observable<CreateDraftApplicationResponse>(observable => {
      observable.error(error);
    }));

    service.createDraftApplication(request).subscribe({
      error: e => {
        expect(e).toEqual(ErrorMappings.application_already_exists);
        expect(httpPostSpy).toHaveBeenCalledWith('/api/applications/draft/', request);
        done();
      }
    });
  });

  const updateDraftRequest = () => {
    return new UpdateDraftApplicationRequest(APPLICATION_ID, {}, {});
  }

  it('#updateDraftApplication should update application successfully', (done) => {
    const request = updateDraftRequest();
    const response: BaseResponse = {
      message: MessageMappings.application_updated
    };

    httpPutSpy.and.returnValue(new Observable<BaseResponse>(observable => {
      observable.next(response);
    }));

    service.updateDraftApplication(request).subscribe(value => {
      expect(value).toBeTruthy();
      expect(value).toEqual(response);
      expect(httpPutSpy).toHaveBeenCalledWith('/api/applications/draft/', request);
      done();
    });
  });

  it('#updateDraftApplication should handle error successfully', (done) => {
    const request = updateDraftRequest();
    const error: HttpErrorResponse = new HttpErrorResponse({
      error: {error: 'illegal_update'}, status: 400
    });

    httpPutSpy.and.returnValue(new Observable<CreateDraftApplicationResponse>(observable => {
      observable.error(error);
    }));

    service.updateDraftApplication(request).subscribe({
      error: e => {
        expect(e).toEqual(ErrorMappings.illegal_update);
        expect(httpPutSpy).toHaveBeenCalledWith('/api/applications/draft/', request);
        done();
      }
    });
  });

  const createSubmitRequest = () => {
    return new SubmitApplicationRequest(APPLICATION_ID);
  }

  it('#submitApplication should submit application successfully', (done) => {
    const request: SubmitApplicationRequest = createSubmitRequest();
    const response: SubmittedApplicationResponse = createSubmittedApplicationResponse(ApplicationStatus.SUBMITTED);

    httpPostSpy.and.returnValue(new Observable<SubmittedApplicationResponse>(observable => {
      observable.next(response);
    }));

    service.submitApplication(request).subscribe(value => {
      expect(value).toBeTruthy();
      expect(value).toEqual(response);
      expect(httpPostSpy).toHaveBeenCalledWith('/api/applications/submit/', request);
      done();
    });
  });

  it('#submitApplication should handle thrown error', (done) => {
    const request: SubmitApplicationRequest = createSubmitRequest();
    const error: HttpErrorResponse = new HttpErrorResponse({
      error: {error: 'invalid_application_status'}, status: 400
    });

    httpPostSpy.and.returnValue(new Observable<SubmittedApplicationResponse>(observable => {
      observable.error(error);
    }));

    service.submitApplication(request).subscribe({
      error: e => {
        expect(e).toEqual(ErrorMappings.invalid_application_status);
        expect(httpPostSpy).toHaveBeenCalledWith('/api/applications/submit/', request);
        done();
      }
    });
  });

  const createAcceptRequest = () => {
    return new AcceptResubmittedRequest(APPLICATION_ID, []);
  }

  it('#racceptResubmitted should accept and resubmit the application to assigned committee members', (done) => {
    const request: AcceptResubmittedRequest = createAcceptRequest();
    const response: SubmittedApplicationResponse = createSubmittedApplicationResponse(ApplicationStatus.REVIEW);

    httpPostSpy.and.returnValue(new Observable<SubmittedApplicationResponse>(observable => {
      observable.next(response);
    }));

    service.acceptResubmitted(request).subscribe(value => {
      expect(value).toBeTruthy();
      expect(value).toEqual(response);
      expect(httpPostSpy).toHaveBeenCalledWith('/api/applications/resubmit/', request);
      done();
    });
  });

  it('#acceptResubmitted should handle error if thrown', (done) => {
    const request: AcceptResubmittedRequest = createAcceptRequest();
    const error: HttpErrorResponse = new HttpErrorResponse({
      error: {error: 'invalid_application_status'}, status: 400
    });

    httpPostSpy.and.returnValue(new Observable<SubmittedApplicationResponse>(observable => {
      observable.error(error);
    }));

    service.acceptResubmitted(request).subscribe({
      error: e => {
        expect(e).toEqual(ErrorMappings.invalid_application_status);
        expect(httpPostSpy).toHaveBeenCalledWith('/api/applications/resubmit/', request);
        done();
      }
    });
  });

  const createReviewRequest = (submitted: boolean) => {
    if (submitted) {
      return new ReviewSubmittedApplicationRequest(APPLICATION_ID, []);
    } else {
      return new ReviewApplicationRequest(APPLICATION_ID, false);
    }
  }

  it('#markReview should mark an application as reviewed', (done) => {
    const request: ReviewApplicationRequest = createReviewRequest(false) as ReviewApplicationRequest;
    const response: SubmittedApplicationResponse = createSubmittedApplicationResponse(ApplicationStatus.REVIEW);

    httpPostSpy.and.returnValue(new Observable<SubmittedApplicationResponse>(observable => {
      observable.next(response);
    }));

    service.markReview(request).subscribe(value => {
      expect(value).toBeTruthy();
      expect(value).toEqual(response);
      expect(httpPostSpy).toHaveBeenCalledWith('/api/applications/review/', request);
      done();
    });
  });

  it('#markReview should handle error if thrown', (done) => {
    const request: ReviewApplicationRequest = createReviewRequest(false) as ReviewApplicationRequest;
    const error: HttpErrorResponse = new HttpErrorResponse({
      error: {error: 'invalid_application_status'}, status: 400
    });

    httpPostSpy.and.returnValue(new Observable<SubmittedApplicationResponse>(observable => {
      observable.error(error);
    }));

    service.markReview(request).subscribe({
      error: e => {
        expect(e).toEqual(ErrorMappings.invalid_application_status);
        expect(httpPostSpy).toHaveBeenCalledWith('/api/applications/review/', request);
        done();
      }
    });
  });

  it('#updateReview should update the current application being reviewed', (done) => {
    const request: ReviewSubmittedApplicationRequest = createReviewRequest(true) as ReviewSubmittedApplicationRequest;
    const response: SubmittedApplicationResponse = createSubmittedApplicationResponse(ApplicationStatus.REVIEW);

    httpPutSpy.and.returnValue(new Observable<SubmittedApplicationResponse>(observable => {
      observable.next(response);
    }));

    service.updateReview(request).subscribe(value => {
      expect(value).toBeTruthy();
      expect(value).toEqual(response);
      expect(httpPutSpy).toHaveBeenCalledWith('/api/applications/review/', request);
      done();
    });
  });

  it('#updateReview should handle error if thrown', (done) => {
    const request: ReviewSubmittedApplicationRequest = createReviewRequest(true) as ReviewSubmittedApplicationRequest;
    const error: HttpErrorResponse = new HttpErrorResponse({
      error: {error: 'invalid_application_status'}, status: 400
    });

    httpPutSpy.and.returnValue(new Observable<SubmittedApplicationResponse>(observable => {
      observable.error(error);
    }));

    service.updateReview(request).subscribe({
      error: e => {
        expect(e).toEqual(ErrorMappings.invalid_application_status);
        expect(httpPutSpy).toHaveBeenCalledWith('/api/applications/review/', request);
        done();
      }
    });
  });

  const createApproveRequest = () => {
    const finalComment = new Comment(2, USERNAME, 'test-comment', 'test-component-id', []);
    return new ApproveApplicationRequest(APPLICATION_ID, true, finalComment);
  }

  it('#approveApplication should approve application successfully', (done) => {
    const request = createApproveRequest();
    const response: SubmittedApplicationResponse = createSubmittedApplicationResponse(ApplicationStatus.APPROVED);

    httpPostSpy.and.returnValue(new Observable<SubmittedApplicationResponse>(observable => {
      observable.next(response);
    }));

    service.approveApplication(request).subscribe(value => {
      expect(value).toBeTruthy();
      expect(value).toEqual(response);
      expect(httpPostSpy).toHaveBeenCalledWith('/api/applications/approve/', request);
      done();
    });
  });

  it('#approveApplication should catch any errors that may occur', (done) => {
    const request = createApproveRequest();
    const error: HttpErrorResponse = new HttpErrorResponse({
      error: {error: 'invalid_application_status'}, status: 400
    });

    httpPostSpy.and.returnValue(new Observable<SubmittedApplicationResponse>(observable => {
      observable.error(error);
    }));

    service.approveApplication(request).subscribe({
      error: e => {
        expect(e).toEqual(ErrorMappings.invalid_application_status);
        expect(httpPostSpy).toHaveBeenCalledWith('/api/applications/approve/', request);
        done();
      }
    });
  });

  const createReferRequest = () => {
    return new ReferApplicationRequest(APPLICATION_ID, [], USERNAME);
  }

  it('#referApplication should refer application successfully', (done) => {
    const request = createReferRequest();
    const response: ReferredApplicationResponse = createReferredApplicationResponse();

    httpPostSpy.and.returnValue(new Observable<ReferredApplicationResponse>(observable => {
      observable.next(response);
    }));

    service.referApplication(request).subscribe(value => {
      expect(value).toBeTruthy();
      expect(value).toEqual(response);
      expect(httpPostSpy).toHaveBeenCalledWith('/api/applications/refer/', request);
      done();
    });
  });

  it('#referApplication should catch any errors that may occur', (done) => {
    const request = createReferRequest();
    const error: HttpErrorResponse = new HttpErrorResponse({
      error: {error: 'invalid_application_status'}, status: 400
    });

    httpPostSpy.and.returnValue(new Observable<ReferredApplicationResponse>(observable => {
      observable.error(error);
    }));

    service.referApplication(request).subscribe({
      error: e => {
        expect(e).toEqual(ErrorMappings.invalid_application_status);
        expect(httpPostSpy).toHaveBeenCalledWith('/api/applications/refer/', request);
        done();
      }
    });
  });

  it('#mapApplicationResponse should map resposne successfully', (done) => {
    const response = createSubmittedApplicationResponse(ApplicationStatus.SUBMITTED);
    const submitted = createSubmittedApplication(ApplicationStatus.SUBMITTED);
    submitted.lastUpdated = undefined;

    service.mapApplicationResponse(response).subscribe(value => {
      value.lastUpdated = undefined;
      expect(value).toEqual(submitted);
      done();
    });
  })
});