import { Component, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Checkbox } from '../../../models/components/checkboxgroupcomponent';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { RadioQuestionComponent } from '../../../models/components/radioquestioncomponent';
import { QuestionChange, QuestionViewComponent, QuestionViewComponentShape, QuestionChangeEvent, ViewComponentShape } from '../application-view.component';
import { CheckboxMapping } from '../checkbox-group-view/checkbox-group-view.component';
import { ViewComponentRegistration } from '../registered.components';
import { Application } from '../../../models/applications/application';
import { Answer, ValueType } from '../../../models/applications/answer';
import { QuestionViewUtils } from '../questionviewutils';

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
   * The parent component if it exists
   */
  @Input() parent: QuestionViewComponent;
  /**
   * The current application object
   */
  @Input() application: Application;
  /**
   * The form group passed into this component
   */
  @Input() form: FormGroup;
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
  /**
   * The css class for the radios
   */
  radioClass: string;

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
    this.radioClass = (this.questionComponent.inline) ? 'form-check form-check-inline' : 'form-check';
    this.addToForm();
    this.questionComponent.options.forEach(option => {
      const checkbox = new Checkbox(option.id, option.label, option.identifier, null, option.value);
      this.radios[option.value] = checkbox;
      this.radioControls[checkbox.value] = new FormControl('');
    });

    QuestionViewUtils.setExistingAnswer(this);
  }

  ngOnDestroy(): void {
    this.questionChange.destroy();
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
    if (this.edit() && !this.form.get(this.questionComponent.componentId)) {
      this._addToForm();
    }
  }

  removeFromForm(): void {
    this.form.removeControl(this.questionComponent.componentId);
  }

  castComponent() {
    return this.component as RadioQuestionComponent;
  }

  private deselectOthers(radio: string) {
    Object.keys(this.radioControls).forEach(key => {
      if (radio != key) {
        this.radioControls[key].setValue('', {emitEvent: false})
      }
    })
  }

  private _emit() {
    this.questionChange.emit(new QuestionChangeEvent(this.component.componentId, this));
  }

  private select(checkbox: string) {
    this.selectedRadioValue = checkbox;
    const control = this.radioControls[checkbox];
    control.setValue(checkbox, {emitEvent: false});
    this.deselectOthers(checkbox);
    this.radioArray.push(control);
  }

  /**
   * Responds to a radio selected
   * @param event the event
   */
  onCheckChange(event) {
    if (event.target.checked) {
      this.select(event.target.value);
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

      this.radioArray.clear();
    }

    this._emit();
  }

  resetSelection() {
    let i = 0;

    this.radioArray.controls.forEach(control => {
      this.radioArray.removeAt(i);
      this.selectedRadioValue = undefined;
      control.setValue('', {emitEvent: false});

      i++;
    });

    this.radioArray.clear();

    if (this.component.componentId in this.application.answers) {
      delete this.application.answers[this.component.componentId];
    }
  }

  display(): boolean {
    return QuestionViewUtils.display(this);
  }

  edit(): boolean {
    return QuestionViewUtils.edit(this);
  }

  setFromAnswer(answer: Answer): void {
    if (answer.valueType != ValueType.OPTIONS) {
      throw new Error('Invalid answer type for a radio question component');
    }

    answer.value.split(',').forEach(option => {
      const value = (option.includes('=')) ? option.split('=')[0]:option;
      this.select(value);
    });

    this.radioArray.markAsTouched();

    this._emit();
  }

  value(): Answer {
    return new Answer(undefined, this.component.componentId, this.selectedRadioValue, ValueType.OPTIONS);
  }
}
