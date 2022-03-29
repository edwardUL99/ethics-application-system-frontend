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
import { ApplicationTemplateDisplayComponent } from '../../application-template-display/application-template-display.component';

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
  @Input() visible: boolean;
  /**
   * The context for autosaving
   */
  autosaveContext: AutosaveContext;
  /**
   * The parent template component
   */
  @Input() template: ApplicationTemplateDisplayComponent;

  constructor() {}

  initialise(data: ViewComponentShape): void {
    const questionData = data as QuestionViewComponentShape;
    this.component = questionData.component;
    this.parent = questionData.parent;
    this.application = data.application;
    this.form = questionData.form;
    this.autosaveContext = questionData.autosaveContext;
    this.template = questionData.template;

    if (questionData.questionChangeCallback) {
      this.questionChange.register(questionData.questionChangeCallback);
    }
  }

  ngOnInit(): void {
    this.questionComponent = this.castComponent();
    this.addToForm();
    this.autofill();
    QuestionViewUtils.setExistingAnswer(this, this.template?.viewingUser);
  }

  ngOnDestroy(): void {
    this.questionChange.destroy();
    this.removeFromForm();
  }

  addToForm(): void {
    if (this.edit() && !this.form.get(this.questionComponent.name)) {
      this.control = (this.control) ? this.control:new FormControl({value: '', disabled: !this.questionComponent.editable});

      const validator = SelectValidator();
      if (this.questionComponent.required && !this.control.hasValidator(validator)) {
        this.control.addValidators(validator);
      }
      
      if (!this.form.get(this.questionComponent.name)) {
        this.form.addControl(this.questionComponent.name, this.control);
      }

      this.autosaveContext?.registerQuestion(this);
    }
  }

  removeFromForm(): void {
    this.control = undefined;
    this.form.removeControl(this.questionComponent.name);
    this.autosaveContext?.removeQuestion(this);
  }

  castComponent() {
    return this.component as SelectQuestionComponent;
  }

  onChange() {
    this.emit(true);
  }

  emit(autosave: boolean) {
    const e = new QuestionChangeEvent(this.component.componentId, this, autosave);
    this.questionChange.emit(e);
    this.autosaveContext?.notifyQuestionChange(e);
  }

  autofill(): void {
    // autofills assuming the value returned is the same as the value key in the options
    if (this.questionComponent.autofill) {
      const resolver = getResolver();
      resolver.resolve(this.questionComponent.autofill).retrieveValue(value => {
        if (value) {
          this.control.setValue((Array.isArray(value)) ? value : [value], {emitEvent: false});
          this.emit(false);
        }
      });
    }
  }

  setFromAnswer(answer: Answer): void {
    if (answer.valueType != ValueType.OPTIONS) {
      throw new Error('Invalid answer type for a select question');
    }

    const options = answer.value.split(',');
    this.control.setValue(options, {emitEvent: false});
    this.control.markAsTouched();
    this.emit(false);
  }

  display(): boolean {
    return QuestionViewUtils.display(this);
  }

  edit(): boolean {
    return QuestionViewUtils.edit(this, true, this.template?.viewingUser);
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

      return new Answer(undefined, this.component.componentId, value, ValueType.OPTIONS);
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
    const display = this.questionComponent?.componentId in this.application?.answers;
    this.visible = display;

    return display;
  }
}
