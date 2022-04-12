import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';

import { Application } from '../../../models/applications/application';
import { TextQuestionComponent } from '../../../models/components/textquestioncomponent';
import { QuestionViewComponentShape } from '../application-view.component';
import { TextQuestionViewComponent } from './text-question-view.component';
import { createDraftApplication } from '../../../../testing/fakes';
import { AutosaveContext } from '../autosave';

describe('TextQuestionViewComponent', () => {
  let component: TextQuestionViewComponent;
  let fixture: ComponentFixture<TextQuestionViewComponent>;
  let application: Application;
  let questionComponent: TextQuestionComponent;
  let form: FormGroup;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ TextQuestionViewComponent ],
      imports: [
        FormsModule,
        ReactiveFormsModule
      ]
    })
    .compileComponents();

    application = createDraftApplication();
    questionComponent = new TextQuestionComponent(1, 'Text Question', 'component-id',
     'Test Question', 'test-question', true, true, 'text');
    
    form = new FormGroup({});
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextQuestionViewComponent);
    component = fixture.componentInstance;

    const data: QuestionViewComponentShape = {
      form: form,
      component: questionComponent,
      application: application,
      autosaveContext: new AutosaveContext(),
      context: undefined
    };

    component.initialise(data);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display required', (done) => {
    const control = form.get(questionComponent.name);
    control.updateValueAndValidity();

    fixture.whenStable().then(() => {
      expect(form.valid).toBeFalsy();
      expect(control.errors?.['required']).toBeTruthy();
      done();
    });
  });

  it('should be valid after value change', (done) => {
    const control = form.get(questionComponent.name);
    control.updateValueAndValidity();

    fixture.whenStable().then(() => {
      expect(form.valid).toBeFalsy();
      expect(control.errors?.['required']).toBeTruthy();
      
      control.setValue('test');

      fixture.whenStable().then(() => {
        expect(form.valid).toBeTruthy();
        expect(form.errors?.['required']).toBeFalsy();
        done();
      });
    });
  })
});