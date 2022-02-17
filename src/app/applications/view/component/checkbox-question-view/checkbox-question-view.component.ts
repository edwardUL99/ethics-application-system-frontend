import { Component, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Checkbox } from '../../../models/components/checkboxgroupcomponent';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { CheckboxQuestionComponent } from '../../../models/components/checkboxquestioncomponent';
import { QuestionChange, QuestionViewComponent, QuestionViewComponentShape, QuestionChangeEvent, ViewComponentShape } from '../application-view.component';
import { CheckboxMapping, CheckboxSelection } from '../checkbox-group-view/checkbox-group-view.component';
import { ViewComponentRegistration } from '../registered.components';
import { ObjectValueType, ValueType, ValueTypes } from '../valuetype';
import { Application } from '../../../models/applications/application';


@Component({
  selector: 'app-checkbox-question-view',
  templateUrl: './checkbox-question-view.component.html',
  styleUrls: ['./checkbox-question-view.component.css']
})
@ViewComponentRegistration(ComponentType.CHECKBOX_QUESTION)
export class CheckboxQuestionViewComponent implements OnInit, QuestionViewComponent {
  /**
   * The component being rendered by this view
   */
  @Input() component: ApplicationComponent;
  /**
   * The current application object
   */
  @Input() application: Application;
  /**
   * The form group passed into this component
   */
  form: FormGroup;
  /**
   * The array of checkboxes
   */
  checkboxArray: FormArray;
  /**
  * Mapping of checkbox names to controls
  */
  checkboxControls = {};
  /**
  * The cast checkbox question compoennt
  */
  questionComponent: CheckboxQuestionComponent
  /**
  * A mapping of checkboxes to the checkbox mapping ID
  */
  checkboxes: CheckboxMapping = {};
  /**
  * A map of values to determine if the selected checkboxes are checked
  */
  selectedCheckboxes: CheckboxSelection = {};
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
    this.questionComponent.options.forEach(option => {
      const checkbox = new Checkbox(option.id, option.label, null);
      checkbox.name = option.name;
      this.checkboxes[option.name] = checkbox;

      this.selectedCheckboxes[checkbox.name] = false;
      this.checkboxControls[checkbox.name] = new FormControl('');
    });
  }

  getCheckboxes() {
    const checkboxList = [];
    Object.keys(this.checkboxes).forEach(key => checkboxList.push(this.checkboxes[key]));

    return checkboxList;
  }

  private _addToForm(): void {
    this.checkboxArray = (this.checkboxArray) ? this.checkboxArray:new FormArray([]);

    if (this.questionComponent.required && !this.checkboxArray.hasValidator(Validators.required)) {
      this.checkboxArray.addValidators(Validators.required);
    }

    this.form.addControl(this.questionComponent.componentId, this.checkboxArray);
  }

  addToForm(): void {
    if (!this.form.get(this.questionComponent.componentId)) {
      this._addToForm();
    }
  }

  removeFromForm(): void {
    this.form.removeControl(this.questionComponent.componentId);
  }

  castComponent() {
    return this.component as CheckboxQuestionComponent;
  }

  /**
   * Get the value of this view
   * @return mapping of selected values
   */
  value(): ValueType {
    const values = {};
    Object.keys(this.checkboxControls).forEach(key => {
      const control = this.checkboxControls[key];
      values[key] = control.value;
    });

    return new ObjectValueType(values);
  }

  /**
   * Responds to a checkbox group selected
   * @param event the event
   * @param checkboxId the title of the checkbox
   */
  onCheckChange(event, checkbox: string) {
    if (event.target.checked) {
      this.selectedCheckboxes[checkbox] = true;
      
      const control = this.checkboxControls[checkbox];
      control.setValue(true, {emitEvent: false})
      this.checkboxArray.push(control);

      
    } else {
      let i = 0;
      
      this.selectedCheckboxes[checkbox] = false;
      this.checkboxArray.controls.forEach(control => {
        if (control.value == event.target.value) {
          this.checkboxArray.removeAt(i);
          return;
        }

        i++;
      });
    }

    this.questionChange.emit(new QuestionChangeEvent(this.component.componentId, this.value()));
  }

  setValue(componentId: string, value: ValueType): boolean {
    if (this.component.componentId == componentId) {
      if (value.type != ValueTypes.OBJECT) {
        console.warn('Invalid type for a checkbox question component, not setting value');
      } else {
        const storedValue = value.getValue();

        for (let key of Object.keys(this.checkboxControls)) {
          if (key in storedValue) {
            this.checkboxControls[key].setValue(storedValue[key], {emitEvent: false});
            return true;
          }
        }
      }
    }

    return false;
  }
}
