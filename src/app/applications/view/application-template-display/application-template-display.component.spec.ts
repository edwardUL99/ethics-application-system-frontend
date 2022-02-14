import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationTemplateDisplayComponent } from './application-template-display.component';

describe('ApplicationTemplateDisplayComponent', () => {
  let component: ApplicationTemplateDisplayComponent;
  let fixture: ComponentFixture<ApplicationTemplateDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApplicationTemplateDisplayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationTemplateDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
