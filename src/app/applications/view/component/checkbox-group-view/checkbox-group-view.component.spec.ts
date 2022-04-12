import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';

import { Application } from '../../../models/applications/application';
import { Checkbox, CheckboxGroupComponent } from '../../../models/components/checkboxgroupcomponent';
import { QuestionViewComponentShape } from '../application-view.component';
import { CheckboxGroupViewComponent } from './checkbox-group-view.component';
import { createDraftApplication } from '../../../../testing/fakes';
import { AutosaveContext } from '../autosave';

describe('CheckboxGroupViewComponent', () => {
  let component: CheckboxGroupViewComponent;
  let fixture: ComponentFixture<CheckboxGroupViewComponent>;
  let application: Application;
  let questionComponent: CheckboxGroupComponent;
  let form: FormGroup;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckboxGroupViewComponent ],
      imports: [
        FormsModule,
        ReactiveFormsModule
      ]
    })
    .compileComponents();

    application = createDraftApplication();
    questionComponent = new CheckboxGroupComponent(1, 'component-id', 'Checkbox Group',
      undefined, [
        new Checkbox(1, 'Chekbox', 'identifier', undefined, 'value')
      ], true, true);
    
    form = new FormGroup({});
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxGroupViewComponent);
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
    const control = form.get(questionComponent.componentId);
    control.updateValueAndValidity();

    fixture.whenStable().then(() => {
      expect(form.valid).toBeFalsy();
      expect(control.errors?.['required']).toBeTruthy();
      done();
    });
  });

  it('should be valid after value change', (done) => {
    const control = form.get(questionComponent.componentId);
    control.updateValueAndValidity();

    fixture.whenStable().then(() => {
      expect(form.valid).toBeFalsy();
      expect(control.errors?.['required']).toBeTruthy();
      
      component.onCheckChange({
        target: {
          checked: true,
          value: 'identifier'
        }
      }, 'identifier');

      fixture.whenStable().then(() => {
        expect(form.valid).toBeTruthy();
        expect(form.errors?.['required']).toBeFalsy();
        done();
      });
    });
  })
});