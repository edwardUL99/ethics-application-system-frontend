import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
  constructor() { }

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

  /**
   * Map the template response and resolve it in an observable
   * @param response the response to map
   */
  mapTemplateResponse(response: ApplicationTemplateResponse): Observable<MappedTemplateResponse> {
    return new Observable<MappedTemplateResponse>(observer => {
      observer.next(mapTemplateResponse(response));
    })
  }
}
