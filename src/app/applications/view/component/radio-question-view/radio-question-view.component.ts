import { Component, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Checkbox } from '../../../models/components/checkboxgroupcomponent';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { RadioQuestionComponent } from '../../../models/components/radioquestioncomponent';
import { QuestionChange, QuestionViewComponent, QuestionViewComponentShape, QuestionChangeEvent, ViewComponentShape } from '../application-view.component';
import { CheckboxMapping } from '../checkbox-group-view/checkbox-group-view.component';
import { ComponentViewRegistration } from '../registered.components';
import { Application } from '../../../models/applications/application';
import { Answer, ValueType } from '../../../models/applications/answer';
import { QuestionViewUtils } from '../questionviewutils';

@Component({
  selector: 'app-radio-question-view',
  templateUrl: './radio-question-view.component.html',
  styleUrls: ['./radio-question-view.component.css']
})
@ComponentViewRegistration(ComponentType.RADIO_QUESTION)
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
   * The group of radios
   */
  radioGroup: FormGroup;
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
   * The question change event emitter
   */
  @Output() questionChange: QuestionChange = new QuestionChange();
  /**
   * The css class for the radios
   */
  radioClass: string;
  /**
   * Determines if the component is visible
   */
  @Input() visible: boolean;

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
      this.radioGroup.addControl(checkbox.value, new FormControl({vaue: '', disabled: !this.questionComponent.editable}));
    });

    QuestionViewUtils.setExistingAnswer(this);
  }

  ngOnDestroy(): void {
    this.questionChange.destroy();
    this.removeFromForm();
  }

  getRadios() {
    const radioList = [];
    Object.keys(this.radios).forEach(key => radioList.push(this.radios[key]));

    return radioList;
  }

  private _addToForm(): void {
    this.radioGroup = (this.radioGroup) ? this.radioGroup:new FormGroup({});

    if (this.questionComponent.required && !this.radioGroup.hasValidator(Validators.required)) {
      this.radioGroup.addValidators(Validators.required);
    }

    if (!this.form.get(this.questionComponent.componentId)) {
      this.form.addControl(this.questionComponent.componentId, this.radioGroup);
    }
  }

  addToForm(): void {
    if (this.edit()) {
      this._addToForm();
    }
  }

  removeFromForm(): void {
    this.form.removeControl(this.questionComponent.componentId);
    this.radioGroup = undefined;
  }

  castComponent() {
    return this.component as RadioQuestionComponent;
  }

  private deselectOthers(radio: string) {
    Object.keys(this.radios).forEach(key => {
      if (radio != key) {
        this.radioGroup.get(key).setValue('', {emitEvent: false})
      }
    });
  }

  emit() {
    this.questionChange.emit(new QuestionChangeEvent(this.component.componentId, this));
  }

  private _emit() {
    if (!this.parent) {
      this.emit();
    }
  }

  private select(checkbox: string) {
    this.selectedRadioValue = checkbox;
    const control = this.radioGroup.get(checkbox);
    control.setValue(checkbox, {emitEvent: false});
    this.deselectOthers(checkbox);
  }

  /**
   * Responds to a radio selected
   * @param event the event
   */
  onCheckChange(event) {
    if (event.target.checked) {
      this.select(event.target.value);
    } else {
      this.radioGroup.get(event.target.value).setValue('', {emitEvent: false});
    }

    this.emit();
  }

  display(): boolean {
    return QuestionViewUtils.display(this);
  }

  edit(): boolean {
    return QuestionViewUtils.edit(this);
  }

  setFromAnswer(answer: Answer): void {
    if (answer && answer.value) {
      if (answer.valueType != ValueType.OPTIONS) {
        throw new Error('Invalid answer type for a radio question component');
      }

      answer.value.split(',').forEach(option => {
        const value = (option.includes('=')) ? option.split('=')[0]:option;
        this.select(value);
      });

      this.radioGroup.markAsTouched();

      this._emit();
    }
  }

  value(): Answer {
    return new Answer(undefined, this.component.componentId, this.selectedRadioValue, ValueType.OPTIONS);
  }

  isVisible(): boolean {
    return this.visible;
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
  }

  displayAnswer(): boolean {
    return this.questionComponent?.componentId in this.application?.answers;
  }
}
