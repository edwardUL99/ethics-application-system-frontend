import { Component, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, ValidationErrors, Validators } from '@angular/forms';
import { getResolver } from '../../../autofill/resolver';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { SelectQuestionComponent } from '../../../models/components/selectquestioncomponent';
import { QuestionChange, QuestionViewComponent, QuestionViewComponentShape, QuestionChangeEvent, ViewComponentShape } from '../application-view.component';
import { ViewComponentRegistration } from '../registered.components';
import { Application } from '../../../models/applications/application';
import { Answer, ValueType } from '../../../models/applications/answer';
import { QuestionViewUtils } from '../questionviewutils';

/**
 * A type that holds the selected options
 */
export type SelectedOptions = {
  [key: string]: boolean
}

/**
 * This function returns a validator that validates the value chosen by select
 * @returns the validator function
 */
export function SelectValidator(): ValidatorFn {
  return (c: FormControl): ValidationErrors | null => {
    const value = c.value;

    if (value.length == 1 && value == '') {
      return {required: true};
    }

    return null;
  }
}

@Component({
  selector: 'app-select-question-view',
  templateUrl: './select-question-view.component.html',
  styleUrls: ['./select-question-view.component.css']
})
@ViewComponentRegistration(ComponentType.SELECT_QUESTION)
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
   * The mapping of selected options
   */
  selected: SelectedOptions = {};
  /**
   * The question change event emitter
   */
  @Output() questionChange: QuestionChange = new QuestionChange();

  constructor() {}

  initialise(data: ViewComponentShape): void {
    const questionData = data as QuestionViewComponentShape;
    this.component = questionData.component;
    this.parent = questionData.parent;
    this.application = data.application;
    this.form = questionData.form;

    if (questionData.questionChangeCallback) {
      this.questionChange.register(questionData.questionChangeCallback);
    }
  }

  ngOnInit(): void {
    this.questionComponent = this.castComponent();
    this.addToForm();
    this.autofill();
    QuestionViewUtils.setExistingAnswer(this);
  }

  ngOnDestroy(): void {
    this.questionChange.destroy();
  }

  addToForm(): void {
    if (this.edit() && !this.form.get(this.questionComponent.name)) {
      this.control = (this.control) ? this.control:new FormControl({value: '', disabled: !this.questionComponent.editable});

      const validator = SelectValidator();
      if (this.questionComponent.required && !this.control.hasValidator(Validators.required) 
        && !this.control.hasValidator(validator)) {
        this.control.addValidators(Validators.required);
        this.control.addValidators(validator);
      }

      this.questionComponent.options.forEach(option => this.selected[option.value] = false);
      this.form.addControl(this.questionComponent.name, this.control);
    }
  }

  removeFromForm(): void {
    this.form.removeControl(this.questionComponent.name);
  }

  castComponent() {
    return this.component as SelectQuestionComponent;
  }

  /**
   * Unselect all options except for the provided one
   * @param option the option to leave selected
   */
  private unselectOthers(option: string) {
    Object.keys(this.selected).forEach(key => {
      if (option != key) {
        this.selected[key] = false;
      }
    })
  }

  onChange(event: any) {
    const option = event.value;
    this.selected[option] = true;

    if (!this.questionComponent.multiple) {
      this.unselectOthers(option);
    }

    this._emit();
  }

  private _emit() {
    this.questionChange.emit(new QuestionChangeEvent(this.component.componentId, this));
  }

  autofill(): void {
    // autofills assuming the value returned is the same as the value key in the options
    if (this.questionComponent.autofill) {
      const resolver = getResolver();
      resolver.resolve(this.questionComponent.autofill).retrieveValue(value => {
        if (value) {
          this.control.setValue((Array.isArray(value)) ? value : [value]);
        }
      });
    }
  }

  setFromAnswer(answer: Answer): void {
    if (answer.valueType != ValueType.OPTIONS) {
      throw new Error('Invalid answer type for a select question');
    }

    const options = answer.value.split(',');
    options.forEach(option => this.selected[option] = true);
    this.control.setValue(options, {emitEvent: false});
    this.control.markAsTouched();
    this._emit();
  }

  display(): boolean {
    return QuestionViewUtils.display(this);
  }

  edit(): boolean {
    return QuestionViewUtils.edit(this);
  }

  value(): Answer {
    const valueRaw = this.control.value;
    let value: string;

    if (Array.isArray(valueRaw)) {
      value = valueRaw.join(',');
    } else {
      value = valueRaw;
    }

    return new Answer(undefined, this.component.componentId, value, ValueType.OPTIONS);
  }
}
