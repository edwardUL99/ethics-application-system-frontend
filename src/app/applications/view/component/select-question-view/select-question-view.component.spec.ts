import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';

import { Application } from '../../../models/applications/application';
import { Option, SelectQuestionComponent } from '../../../models/components/selectquestioncomponent';
import { QuestionViewComponentShape } from '../application-view.component';
import { SelectQuestionViewComponent } from './select-question-view.component';
import { createDraftApplication } from '../../../../testing/fakes';
import { AutosaveContext } from '../autosave';

describe('SelectQuestionViewComponent', () => {
  let component: SelectQuestionViewComponent;
  let fixture: ComponentFixture<SelectQuestionViewComponent>;
  let application: Application;
  let questionComponent: SelectQuestionComponent;
  let form: FormGroup;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectQuestionViewComponent ],
      imports: [
        FormsModule,
        ReactiveFormsModule
      ]
    })
    .compileComponents();

    application = createDraftApplication();
    questionComponent = new SelectQuestionComponent(1, 'Select Question', 'component-id', 'Test Question', 'test-question',
      true, false, [
        new Option(2, 'Value', 'value', 'identifier'),
        new Option(3, 'Value 1', 'value1', 'identifier1')
      ]);
    
    form = new FormGroup({});
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectQuestionViewComponent);
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
      
      control.setValue('value');

      fixture.whenStable().then(() => {
        expect(form.valid).toBeTruthy();
        expect(form.errors?.['required']).toBeFalsy();
        done();
      });
    });
  })
});