import { Injectable } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { Application } from './models/applications/application';
import { ApplicationService } from './application.service';
import { ApplicationResponse } from './models/requests/applicationresponse';

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

  constructor(private applicationService: ApplicationService) {
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
          next: application => observable.next(application),
          error: e => observable.error(e)
        });
      }

      return new Observable<Application>(observable => {
        this.applicationService.getApplication({id: this._applicationId})
          .subscribe({
            next: response => nextHandler(response, observable),
            error: e => observable.error(e)
          });
      });
    } else {
      return new Observable<Application>(observable => {
        observable.next(this._application);
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
}