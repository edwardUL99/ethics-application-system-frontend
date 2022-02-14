import { Component, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Checkbox } from '../../../models/components/checkboxgroupcomponent';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { RadioQuestionComponent } from '../../../models/components/radioquestioncomponent';
import { QuestionChange, QuestionViewComponent, QuestionViewComponentShape, QuestionChangeEvent, ViewComponentShape } from '../application-view.component';
import { CheckboxMapping } from '../checkbox-group-view/checkbox-group-view.component';
import { ViewComponentRegistration } from '../registered.components';
import { StringValueType, ValueType, ValueTypes } from '../valuetype';

@Component({
  selector: 'app-radio-question-view',
  templateUrl: './radio-question-view.component.html',
  styleUrls: ['./radio-question-view.component.css']
})
@ViewComponentRegistration(ComponentType.RADIO_QUESTION)
export class RadioQuestionViewComponent implements OnInit, QuestionViewComponent {
  /**
   * The component being rendered by this view
   */
  @Input() component: ApplicationComponent;
  /**
   * The form group passed into this component
   */
  form: FormGroup;
  /**
   * The array of radios
   */
  radioArray: FormArray;
  /**
  * The cast radio question compoennt
  */
  questionComponent: RadioQuestionComponent
  /**
  * A mapping of radios to the radio mapping ID
  */
  radios: CheckboxMapping = {};
  /**
   * The selected radio value
   */
  selectedRadioValue: string;
  /**
  * Mapping of option names to controls
  */
  radioControls = {};
  /**
   * The question change event emitter
   */
  @Output() questionChange: QuestionChange = new QuestionChange();

  constructor() { }

  initialise(data: ViewComponentShape): void {
    const questionData = data as QuestionViewComponentShape;
    this.component = questionData.component;
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
      this.radios[option.name] = checkbox;
      this.radioControls[checkbox.name] = new FormControl('');
    });
  }

  getRadios() {
    const radioList = [];
    Object.keys(this.radios).forEach(key => radioList.push(this.radios[key]));

    return radioList;
  }

  private _addToForm(): void {
    this.radioArray = (this.radioArray) ? this.radioArray:new FormArray([]);

    if (this.questionComponent.required && !this.radioArray.hasValidator(Validators.required)) {
      this.radioArray.addValidators(Validators.required);
    }

    this.form.addControl(this.questionComponent.componentId, this.radioArray);
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
    return this.component as RadioQuestionComponent;
  }

  /**
   * Get the value of this view
   * @return the radio value chosen
   */
  value(): ValueType {
    return new StringValueType(this.selectedRadioValue);
  }

  private deselectOthers(radio: string) {
    Object.keys(this.radioControls).forEach(key => {
      if (radio != key) {
        this.radioControls[key].setValue('', {emitEvent: false})
      }
    })
  }

  /**
   * Responds to a radio selected
   * @param event the event
   * @param checkbox the title of the checkbox
   */
  onCheckChange(event, checkbox: string) {
    if (event.target.checked) {
      const control = this.radioControls[checkbox];
      control.setValue(true, {emitEvent: false});
      this.deselectOthers(checkbox);
      this.radioArray.push(control);
      this.selectedRadioValue = checkbox;
    } else {
      let i = 0;

      this.radioArray.controls.forEach(control => {
        if (control.value == event.target.value) {
          this.radioArray.removeAt(i);
          this.selectedRadioValue = undefined;
          control.setValue('', {emitEvent: false});
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
        console.warn('Invalid value type for a radio question component, not setting value');
      } else {
        const storedValue = value.getValue();

        for (let key of Object.keys(this.radioControls)) {
          if (key in storedValue) {
            this.radioControls[key].setValue(true, {emitEvent: false});
            this.selectedRadioValue = key;

            return true;
          }
        }
      }
    }

    return false;
  }
}
