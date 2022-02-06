import { TestBed } from '@angular/core/testing';

import { ApplicationTemplateService } from './application-template.service';

// TODO write tests here

describe('ApplicationTemplateService', () => {
  let service: ApplicationTemplateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApplicationTemplateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
