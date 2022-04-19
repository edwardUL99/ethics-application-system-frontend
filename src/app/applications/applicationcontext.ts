import { Injectable } from '@angular/core';
import { Observable, share, Subscriber } from 'rxjs';
import { Application } from './models/applications/application';
import { ApplicationService } from './application.service';
import { ApplicationResponse } from './models/requests/applicationresponse';
import { UserContext } from '../users/usercontext';
import { User } from '../users/user';
import { AuthorizationService } from '../users/authorization.service';
import { joinAndWait } from '../utils';
import { Authorizer } from '../users/authorizations';

/**
 * This class represents the context that stores the current application
 */
@Injectable()
export class ApplicationContext {
  /**
   * The application held in the context
   */
  private _application: Application;
  /**
   * The ID of the current application
   */
  private _applicationId: string;

  constructor(private applicationService: ApplicationService,
    private userContext: UserContext,
    private authorizationService: AuthorizationService) {
    const id = sessionStorage.getItem('_applicationId');

    if (id && (this._application && this._application.applicationId == id)) {
      this._applicationId = id;
    }
  }

  /**
   * Clear the application context 
   */
  clearContext() {
    this._application = undefined;
    this._applicationId = undefined;
    sessionStorage.removeItem('_applicationId');
  }

  /**
   * Retrieve the application held in the context
   */
  getApplication(): Observable<Application> {
    if (!this._application) {
      const nextHandler = (response: ApplicationResponse, observable: Subscriber<Application>) => {
        this.applicationService.mapApplicationResponse(response).subscribe({
          next: application => {
            observable.next(application);
            observable.complete();
          },
          error: e => {
            observable.error(e);
            observable.complete();
          }
        });
      }

      return new Observable<Application>(observable => {
        this.applicationService.getApplication({id: this._applicationId})
          .subscribe({
            next: response => nextHandler(response, observable),
            error: e => {
              observable.error(e);
              observable.complete();
            }
          });
      });
    } else {
      return new Observable<Application>(observable => {
        observable.next(this._application);
        observable.complete();
      });
    }
  }

  /**
   * Set the context's current application
   * @param application the application to set
   */
  setApplication(application: Application) {
    this._application = application;
    this._applicationId = application.applicationId;
    sessionStorage.setItem('_applicationId', this._applicationId);
  }

  /**
   * Get the user from the user context that is viewing/reviewing the application
   * @param applicantKnown If it is already known that the viewing user is an applicant (i.e. creating a new application),
   * pass this in as true
   */
  getViewingUser(applicantKnown:  boolean = false): Observable<ViewingUser> {
    const observables: Observable<any>[] = [this.userContext.getUser()];

    if (!applicantKnown) {
      observables.push(this.getApplication());
    }

    return new Observable<ViewingUser>(observer => {
      joinAndWait<any>(observables)
        .pipe(
          share()
        )
        .subscribe({
          next: response => {
            const user = response[0] as User;
            const applicant = (!applicantKnown) ? user.username == response[1].user.username : applicantKnown;
            const userPermissions = new Set(user.role.permissions);

            this.authorizationService.getPermissions().subscribe({
              next: permissions => {
                const create = Authorizer.hasPermission(userPermissions, permissions.CREATE_APPLICATION);
                const reviewer = Authorizer.hasPermission(userPermissions, permissions.REVIEW_APPLICATIONS);
                const admin = Authorizer.hasPermission(userPermissions, permissions.ADMIN);
                observer.next(new ViewingUser(user, create, applicant, reviewer, admin));
                observer.complete();
              },
              error: e => {
                observer.error(e);
                observer.complete();
              }
            });
          },
          error: e => {
            observer.error(e);
            observer.complete();
          }
        });
    });
  }
}

/**
 * This class represents a user that is viewing the application
 */
export class ViewingUser {
  /**
   * Create the ViewingUser object
   * @param user the user viewing the application
   * @param create true if the viewing user can create an application
   * @param applicant true if the user is the applicant that created the application
   * @param reviewer true if the viewer is a reviewer
   * @param admin true if the viewer has admin permissions
   * @param givingInput true if the user isn't an applicant but has been asked to give input
   */
  constructor(public user: User, public create, public applicant: boolean = false,
    public reviewer: boolean = false, public admin: boolean = false, public givingInput = false) {}
}