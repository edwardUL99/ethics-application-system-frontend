import { Component, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { getResolver } from '../../../autofill/resolver';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { SelectQuestionComponent } from '../../../models/components/selectquestioncomponent';
import { QuestionChange, QuestionViewComponent, QuestionViewComponentShape, QuestionChangeEvent, ViewComponentShape } from '../application-view.component';
import { ViewComponentRegistration } from '../registered.components';
import { ArrayValueType, StringValueType, ValueType, ValueTypes } from '../valuetype';
import { Application } from '../../../models/applications/application';

/**
 * A type that holds the selected options
 */
export type SelectedOptions = {
  [key: string]: boolean
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

  constructor() { }

  initialise(data: ViewComponentShape): void {
    const questionData = data as QuestionViewComponentShape;
    this.component = questionData.component;
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
  }

  addToForm(): void {
    if (!this.form.get(this.questionComponent.name)) {
      this.control = (this.control) ? this.control:new FormControl('');

      if (this.questionComponent.required && !this.control.hasValidator(Validators.required)) {
        this.control.addValidators(Validators.required);
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

  value(): ValueType {
    if (this.questionComponent.multiple) {
      return new ArrayValueType(this.control?.value);
    } else {
      return new StringValueType(this.control?.value);
    }
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

    this.questionChange.emit(new QuestionChangeEvent(this.component.componentId, this.value()));
  }

  setValue(componentId: string, value: ValueType): boolean {
    if (componentId == this.component.componentId) {
      if (value.type == ValueTypes.STRING || value.type == ValueTypes.ARRAY) {
        let val = value.getValue();
        val = (value.type == ValueTypes.STRING) ? [val] : val;

        for (let val1 of val) {
          if (val1 in this.selected) {
            this.selected[val1] = true;
          }
        }

        this.control.setValue(val, {emitEvent: false});
      } else {
        console.warn('Invalid ValueType for a SelectQuestion, not setting value');
      }

      return true;
    }

    return false;
  }

  autofill(): void {
    // autofills assuming the value returned is the same as the value key in the options
    if (this.questionComponent.autofill) {
      const resolver = getResolver();
      resolver.resolve(this.questionComponent.autofill).retrieveValue(value => {
        this.setValue(this.component.componentId, (Array.isArray(value)) ? new ArrayValueType(value) : new StringValueType(value));
        this.questionChange.emit(new QuestionChangeEvent(this.component.componentId, this.value())); // propagate the autofill
      });
    }
  }
}
