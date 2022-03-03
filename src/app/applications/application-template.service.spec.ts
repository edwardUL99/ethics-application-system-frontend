import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';

import { createApplicationTemplate, createApplicationTemplateResponse, createApplicationTemplateShape, TEMPLATE_ID } from '../testing/fakes';
import { getErrorMessage } from '../utils';
import { ApplicationTemplateService } from './application-template.service';
import { ApplicationTemplateResponse, MappedTemplateResponse, TemplateMapping } from './applicationtemplateresponse';
import { ApplicationTemplate } from './models/applicationtemplate';
import { ApplicationComponent } from './models/components/applicationcomponent';
import { SectionComponent } from './models/components/sectioncomponent';
import { ApplicationTemplateShape } from './models/parsing/applicationtemplateparser';
import { ComponentObject } from './models/parsing/converters';


describe('ApplicationTemplateService', () => {
  let service: ApplicationTemplateService;
  let template: ApplicationTemplate;
  let httpSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        ApplicationTemplateService
      ]
    });
    service = TestBed.inject(ApplicationTemplateService);
    template = createApplicationTemplate();

    const http = TestBed.inject(HttpClient);
    httpSpy = spyOn(http, 'get');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#parseTemplate should parse template', (done) => {
    const templateJSON: ApplicationTemplateShape = JSON.parse(JSON.stringify(template));

    service.parseTemplate(templateJSON).subscribe(data => {
      expect(data instanceof ApplicationTemplate).toBeTruthy();
      expect(data).toEqual(template);
      done();
    });
  });

  it('#parseComponent should parse component', (done) => {
    const component: ApplicationComponent = template.components[0];
    const componentJson: ComponentObject = JSON.parse(JSON.stringify(component));

    service.parseComponent(componentJson).subscribe(data => {
      expect(data instanceof SectionComponent).toBeTruthy();
      expect(data).toEqual(component);
      done();
    });
  });

  it('#copy should copy template', (done) => {
    service.copy(template).subscribe(data => {
      expect(data instanceof ApplicationTemplate);
      expect(data).toEqual(template);
      expect(data).not.toBe(template);
      
      const dataTemplate = data as ApplicationTemplate;
      dataTemplate.version = 'new version';
      expect(dataTemplate.version).not.toEqual(template.version);

      done();
    })
  });

  it('#copy should copy component', (done) => {
    const component: ApplicationComponent = template.components[0];

    service.copy(component).subscribe(data => {
      expect(data instanceof SectionComponent);
      expect(data).toEqual(component);
      expect(data).not.toBe(template);

      const dataComponent = data as SectionComponent;
      dataComponent.title = '';
      expect(dataComponent.title).not.toEqual(component.title);

      done();
    })
  });

  it('#mapTemplateResponse should map response', (done) => {
    const response = createApplicationTemplateResponse();

    httpSpy.and.returnValue(new Observable<ApplicationTemplateResponse>(observer => {
      observer.next(response);
    }));

    const templateMapping: TemplateMapping = {};
    templateMapping[TEMPLATE_ID] = template;
    const expected: MappedTemplateResponse = new MappedTemplateResponse(templateMapping);

    service.mapTemplateResponse().subscribe(data => {
      expect(data instanceof MappedTemplateResponse).toBeTruthy();
      expect(data).toEqual(expected);
      expect(httpSpy).toHaveBeenCalled();

      done();
    });
  });

  it('#mapTemplateResponse should be thrown', (done) => {
    const error: HttpErrorResponse = new HttpErrorResponse({
      status: 404
    });
    
    httpSpy.and.returnValue(new Observable(observer => observer.error(error)));

    service.mapTemplateResponse().subscribe({
      error: e => {
        expect(e).toEqual('Not Found');
        done();
      }
    });
  });

  it('#getTemplate should return template', (done) => {
    const templateShape = createApplicationTemplateShape();

    httpSpy.and.returnValue(new Observable<ApplicationTemplateShape>(observer => {
      observer.next(templateShape);
    }));

    const template = createApplicationTemplate();

    service.getTemplate(1).subscribe(value => {
      expect(value).toBeTruthy();
      expect(value instanceof ApplicationTemplate).toBeTruthy();
      expect(value).toEqual(template);
      expect(httpSpy).toHaveBeenCalled();

      done();
    });
  });

  it('#getTemplate should catch error if it occurs', (done) => {
    const error: HttpErrorResponse = new HttpErrorResponse({
      status: 404
    });
    
    httpSpy.and.returnValue(new Observable(observer => observer.error(error)));

    service.getTemplate(1).subscribe({
      error: e => {
        expect(e).toEqual('Not Found');
        done();
      }
    });
  });
});
