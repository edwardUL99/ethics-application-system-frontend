import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Checkbox } from '../../../models/components/checkboxgroupcomponent';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { RadioQuestionComponent } from '../../../models/components/radioquestioncomponent';
import { ApplicationViewComponent } from '../application-view.component';
import { CheckboxMapping } from '../checkbox-group-view/checkbox-group-view.component';
import { ViewComponentRegistration } from '../registered.components';

@Component({
  selector: 'app-radio-question-view',
  templateUrl: './radio-question-view.component.html',
  styleUrls: ['./radio-question-view.component.css']
})
@ViewComponentRegistration(ComponentType.RADIO_QUESTION)
export class RadioQuestionViewComponent implements OnInit, ApplicationViewComponent {
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

  constructor() { }

  ngOnInit(): void {
  }

  getRadios() {
    const radioList = [];
    Object.keys(this.radios).forEach(key => radioList.push(this.radios[key]));

    return radioList;
  }

  ngOnChanges(): void {
    this.questionComponent = this.castComponent();

    if (this.form && !this.form.get(this.questionComponent.componentId)) {
      this.radioArray = new FormArray([]);
      this.form.addControl(this.questionComponent.componentId, this.radioArray);
      this.questionComponent.options.forEach(option => {
        const checkbox = new Checkbox(option.id, option.label, null);
        checkbox.name = option.name;
        this.radios[option.name] = checkbox;
      });
    }
  }

  castComponent() {
    return this.component as RadioQuestionComponent;
  }

  /**
   * Get the value of this view
   * @return the radio value chosen
   */
  get value() {
    return this.selectedRadioValue;
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
  }
}
