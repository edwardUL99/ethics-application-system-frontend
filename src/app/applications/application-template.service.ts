import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, retry, throwError } from 'rxjs';
import { getErrorMessage } from '../utils';
import { ApplicationTemplateResponse, MappedTemplateResponse, mapTemplateResponse } from './applicationtemplateresponse';
import { ApplicationTemplate } from './models/applicationtemplate';
import { ApplicationComponent } from './models/components/applicationcomponent';
import { ApplicationTemplateParser, ApplicationTemplateShape } from './models/parsing/applicationtemplateparser';
import { ComponentObject, Converters } from './models/parsing/converters';

/**
 * This service provides functions for working with application templates
 */
@Injectable()
export class ApplicationTemplateService {
  constructor(private http: HttpClient) { }

  /**
   * Parse the application template and resolve it in an observable
   * @param application the application template
   */
  parseTemplate(application: ApplicationTemplateShape): Observable<ApplicationTemplate> {
    return new Observable<ApplicationTemplate>(observer => {
      observer.next(ApplicationTemplateParser.parseApplication(application));
      observer.complete();
    });
  }

  /** 
   * Parse the specific component and resolve it in an observable 
   */
  parseComponent(component: ComponentObject): Observable<ApplicationComponent> {
    return new Observable<ApplicationComponent>(observer => {
      observer.next(Converters.get(component.type).convert(component));
      observer.complete();
    });
  }

  /**
   * Deep copy a template or component and resolve it in an observable
   * @param component the component/template to deep copy
   */
  copy(component: ApplicationTemplate | ApplicationComponent): Observable<ApplicationTemplate | ApplicationComponent> {
    if (component instanceof ApplicationTemplate) {
      const copied: ApplicationTemplateShape = JSON.parse(JSON.stringify(component));
      return this.parseTemplate(copied);
    } else if (component instanceof ApplicationComponent) {
      const copied: ComponentObject = JSON.parse(JSON.stringify(component));
      return this.parseComponent(copied);
    }
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status == 404) {
      return throwError(() => "Not Found");
    } else {
      return throwError(() => getErrorMessage(error));
    }
  }

  /**
   * Retrieve and map the template response and resolve it in an observable
   */
  mapTemplateResponse(): Observable<MappedTemplateResponse> {
    return new Observable<MappedTemplateResponse>(observer => {
      this.http.get<ApplicationTemplateResponse>('/api/applications/templates/')
        .pipe(
          retry(3),
          catchError(this.handleError)
        )
        .subscribe({
          next: response => {
            observer.next(mapTemplateResponse(response));
            observer.complete();
          },
          error: e => observer.error(e)
        });
    });
  }

  /**
   * Retrieve the saved template with the given ID
   * @param id the ID of the saved template
   * @returns the retrieved and parsed template
   */
  getTemplate(id: number): Observable<ApplicationTemplate> {
    return new Observable<ApplicationTemplate>(observer => {
      this.http.get<ApplicationTemplateShape>(`/api/applications/template?id=${id}`)
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .subscribe({
        next: response => {
          observer.next(ApplicationTemplateParser.parseApplication(response));
          observer.complete();
        },
        error: e => observer.error(e)
      });
    });
  }
}
