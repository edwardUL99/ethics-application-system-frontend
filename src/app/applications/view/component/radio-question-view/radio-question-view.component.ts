import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Checkbox } from '../../../models/components/checkboxgroupcomponent';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { RadioQuestionComponent } from '../../../models/components/radioquestioncomponent';
import { QuestionViewComponent, QuestionViewComponentShape, QuestionViewEvent, ViewComponentShape } from '../application-view.component';
import { CheckboxMapping } from '../checkbox-group-view/checkbox-group-view.component';
import { ViewComponentRegistration } from '../registered.components';
import { StringValueType, ValueType } from '../valuetype';

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
   * The selected radio valu
   */
  selectedRadioValue: string;
  /**
  * Mapping of option names to controls
  */
  radioControls = {};
  /**
   * The question change event emitter
   */
  @Output() questionChange: EventEmitter<QuestionViewEvent>;

  constructor() { }

  initialise(data: ViewComponentShape): void {
    const questionData = data as QuestionViewComponentShape;
    this.component = questionData.component;
    this.form = questionData.form;
  }

  ngOnInit(): void {
    this.questionComponent = this.castComponent();

    this.addToForm();
    this.questionComponent.options.forEach(option => {
      const checkbox = new Checkbox(option.id, option.label, null);
      checkbox.name = option.name;
      this.radios[option.name] = checkbox;
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

  /**
   * Responds to a checkbox group selected
   * @param event the event
   * @param checkboxId the title of the checkbox
   */
  onCheckChange(event, checkbox: string) {
    if (event.target.checked) {
      const control = new FormControl(event.target.value);
      this.radioControls[checkbox] = control;
      this.radioArray.push(control);

      
    } else {
      let i = 0;

      delete this.radioControls[checkbox];
      this.radioArray.controls.forEach(control => {
        if (control.value == event.target.value) {
          this.radioArray.removeAt(i);
          return;
        }

        i++;
      });
    }

    this.questionChange.emit(new QuestionViewEvent(this.component.componentId, this.value()));
  }
}
