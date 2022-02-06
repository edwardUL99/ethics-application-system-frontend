import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, retry, throwError } from 'rxjs';
import { getErrorMessage } from '../utils';
import { ApplicationTemplateResponse, MappedTemplateResponse, mapTemplateResponse } from './applicationremplateresponse';
import { ApplicationTemplate } from './models/applicationtemplate';
import { ApplicationComponent } from './models/components/applicationcomponent';
import { ApplicationTemplateParser, ApplicationTemplateShape } from './models/parsing/applicationtemplateparser';
import { ComponentObject, Converters } from './models/parsing/converters';

/**
 * This service provides functions for working with application templates
 */
@Injectable({
  providedIn: 'root'
})
export class ApplicationTemplateService {
  constructor(private http: HttpClient) { }

  /**
   * Parse the application template and resolve it in an observable
   * @param application the application template
   */
  parseTemplate(application: ApplicationTemplateShape): Observable<ApplicationTemplate> {
    return new Observable<ApplicationTemplate>(observer => {
      observer.next(ApplicationTemplateParser.parseApplication(application));
    });
  }

  /** 
   * Parse the specific component and resolve it in an observable 
   */
  parseComponent(component: ComponentObject): Observable<ApplicationComponent> {
    return new Observable<ApplicationComponent>(observer => {
      observer.next(Converters.get(component.type).convert(component));
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
    return throwError(() => getErrorMessage(error));
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
          next: response => observer.next(mapTemplateResponse(response)),
          error: e => observer.error(e)
        });
    });
  }
}
