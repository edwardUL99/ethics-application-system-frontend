import { Component, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { getResolver } from '../../../autofill/resolver';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { SelectQuestionComponent } from '../../../models/components/selectquestioncomponent';
import { QuestionChange, QuestionViewComponent, QuestionViewComponentShape, QuestionChangeEvent, ViewComponentShape } from '../application-view.component';
import { ComponentViewRegistration } from '../registered.components';
import { Application } from '../../../models/applications/application';
import { Answer, ValueType } from '../../../models/applications/answer';
import { QuestionViewUtils } from '../questionviewutils';
import { AutosaveContext } from '../autosave';
import { AutofillNotifier } from '../../../autofill/autofillnotifier';
import { ApplicationStatus } from '../../../models/applications/applicationstatus';
import { resolveStatus } from '../../../models/requests/mapping/applicationmapper';
import { ComponentDisplayContext } from '../displaycontext';

/**
 * This function returns a validator that validates the value chosen by select
 * @returns the validator function
 */
export function SelectValidator(): ValidatorFn {
  return (c: FormControl): ValidationErrors | null => {
    const value = c.value;
    
    if (Array.isArray(value)) {
      if (value.length == 0 || (value.length == 1 && value[0] == '')) {
        return {required: true};
      }
    } else {
      if (value == '') {
        return {required: true};
      }
    }

    return null;
  }
}

@Component({
  selector: 'app-select-question-view',
  templateUrl: './select-question-view.component.html',
  styleUrls: ['./select-question-view.component.css']
})
@ComponentViewRegistration(ComponentType.SELECT_QUESTION)
export class SelectQuestionViewComponent implements OnInit, QuestionViewComponent {
  /**
   * The component being rendered by the view
   */
  @Input() component: ApplicationComponent;
  /**
   * The parent component if it exists
   */
  @Input() parent: QuestionViewComponent;
  /**
   * The form passed to this component
   */
  @Input() form: FormGroup;
  /**
   * The cast component
   */
  questionComponent: SelectQuestionComponent;
  /**
   * The current application object
   */
  @Input() application: Application;
  /**
   * The form control representing the select question
   */
  control: FormControl;
  /**
   * The question change event emitter
   */
  @Output() questionChange: QuestionChange = new QuestionChange();
  /**
   * Determines if the component is visible
   */
  @Input() visible: boolean = true;
  /**
   * The context for autosaving
   */
  autosaveContext: AutosaveContext;
  /**
   * Determines if the component should hide comments (don't display them). This can be used if parent components wish to
   * manage the comments at a top-level rather than at the child question level
   */
  hideComments: boolean;
  /**
   * The display context the view component is being rendered inside
   */
  @Input() context: ComponentDisplayContext;
  /**
   * The notifier of autofill events
   */
  private autofillNotifier: AutofillNotifier;
  /**
   * The validator for the control
   */
  private readonly validator = SelectValidator();

  constructor() {}

  initialise(data: ViewComponentShape): void {
    const questionData = data as QuestionViewComponentShape;
    this.component = questionData.component;
    this.parent = questionData.parent;
    this.application = data.application;
    this.form = questionData.form;
    this.autosaveContext = questionData.autosaveContext;
    this.context = questionData.context;
    this.hideComments = questionData.hideComments;

    if (questionData.questionChangeCallback) {
      this.questionChange.register(questionData.questionChangeCallback);
    }
  }

  ngOnInit(): void {
    this.addToForm();
    this.autofill();
  }

  ngOnDestroy(): void {
    this.questionChange.destroy();
    this.autofillNotifier?.detach(this);
    this.removeFromForm();
  }

  addToForm(): void {
    this.questionComponent = this.castComponent();
    this.control = (this.control) ? this.control:new FormControl({value: '', disabled: !this.questionComponent.editable});

    if (this.edit()) {
      if (!this.form.get(this.questionComponent.name)) {
        if (this.questionComponent.required && !this.control.hasValidator(this.validator)) {
          this.control.addValidators(this.validator);
        }
        
        if (!this.form.get(this.questionComponent.name)) {
          this.form.addControl(this.questionComponent.name, this.control);
        }
      }

      this.autosaveContext?.registerQuestion(this);
    } else {
      this.autosaveContext?.removeQuestion(this);
    }

    QuestionViewUtils.setExistingAnswer(this);
  }

  removeFromForm(): void {
    if (this.questionComponent) {
      this.control = undefined;
      this.form.removeControl(this.questionComponent.name);
      this.autosaveContext?.removeQuestion(this);
    }
  }

  castComponent() {
    return this.component as SelectQuestionComponent;
  }

  onChange() {
    this.emit(true);
  }

  emit(autosave: boolean, emitChange: boolean = true): void {
    const e = new QuestionChangeEvent(this.component.componentId, this, autosave);
    
    if (emitChange)
      this.questionChange.emit(e);

    this.autosaveContext?.notifyQuestionChange(e);
  }

  autofill(): void {
    // autofills assuming the value returned is the same as the value key in the options
    if (this.questionComponent.autofill) {
      if (!this.autofillNotifier) {
        console.warn("Autofill events are not being notified by this component, this may lead to the value filled by autofill being ignored and not saved");
      }

      const resolver = getResolver();

      if (resolver) {
        resolver.resolve(this.questionComponent.autofill).retrieveValue(value => {
          if (value && (resolveStatus(this.application.status) == ApplicationStatus.DRAFT || !(this.questionComponent.componentId in this.application.answers))) {
            this.control.setValue((Array.isArray(value)) ? value : [value], {emitEvent: false});
            this.emit(false);
            this.autofillNotifier?.notify(this);
          }
        });
      }
    }
  }

  registerAutofill(notifier: AutofillNotifier) {
    notifier?.attach(this);
    this.autofillNotifier = notifier;
  }

  setFromAnswer(answer: Answer): void {
    if (answer.valueType != ValueType.OPTIONS) {
      throw new Error('Invalid answer type for a select question');
    }

    const options = answer.value.split(',');
    this.control.setValue(options, {emitEvent: false});
    this.control.markAsTouched();
    this.emit(false, false);
  }

  display(): boolean {
    return QuestionViewUtils.display(this);
  }

  edit(): boolean {
    return QuestionViewUtils.edit(this, true, this.context?.viewingUser);
  }

  value(): Answer {
    if (this.control) {
      const valueRaw = this.control.value;
      let value: string;

      if (Array.isArray(valueRaw)) {
        value = valueRaw.join(',');
      } else {
        value = valueRaw;
      }

      return new Answer(undefined, this.component.componentId, value, ValueType.OPTIONS, undefined);
    } else {
      return null;
    }
  }

  isVisible(): boolean {
    return this.visible;
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
  }

  displayAnswer(): boolean {
    return QuestionViewUtils.displayAnswer(this);
  }

  setDisabled(disabled: boolean): void {
    if (disabled) {
      this.control.disable();
    } else {
      this.control.enable();
    }
  }

  markRequired(): void {
    if (!this.control?.hasValidator(this.validator)) {
      this.control.addValidators(this.validator);
      this.form.updateValueAndValidity();
    }
  }
}
