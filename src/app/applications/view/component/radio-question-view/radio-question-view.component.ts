import { Component, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Checkbox } from '../../../models/components/checkboxgroupcomponent';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { RadioQuestionComponent } from '../../../models/components/radioquestioncomponent';
import { QuestionChange, QuestionViewComponent, QuestionViewComponentShape, QuestionChangeEvent, ViewComponentShape } from '../application-view.component';
import { CheckboxMapping } from '../checkbox-group-view/checkbox-group-view.component';
import { ComponentViewRegistration } from '../registered.components';
import { Application } from '../../../models/applications/application';
import { Answer, ValueType } from '../../../models/applications/answer';
import { QuestionViewUtils } from '../questionviewutils';
import { AutosaveContext } from '../autosave';
import { ComponentDisplayContext } from '../displaycontext';

/**
 * A custom validator as Validators.required is not working
 */
function RadioValidator(component: RadioQuestionViewComponent): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (component.selectedRadioValue == undefined || component.selectedRadioValue == '' || component.selectedRadioValue == null) {
      return {required: true};
    } else {
      return null;
    }
  }
}

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
   * Variable to determine if radios should be disabled
   */
  disableRadios: boolean = false;
  /**
   * Validator for this component
   */
  private readonly validator: ValidatorFn;

  constructor() {
    this.validator = RadioValidator(this);
  }

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
    this.questionComponent = this.castComponent();
    this.radioClass = (this.questionComponent.inline) ? 'form-check form-check-inline' : 'form-check';
    this.addToForm();
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
    if (this.questionComponent.required) {
      this.radioGroup.addValidators(this.validator);
    }

    if (!this.form.get(this.questionComponent.name)) {
      this.form.addControl(this.questionComponent.name, this.radioGroup);
    }
  }

  addToForm(): void {
    this.questionComponent = this.castComponent();
    const newRadioGroup = !this.radioGroup;
    this.radioGroup = (!newRadioGroup) ? this.radioGroup:new FormGroup({});

    if (newRadioGroup) {
      this.questionComponent.options.forEach(option => {
        const checkbox = new Checkbox(option.id, option.label, option.identifier, null, option.value);
        this.radios[option.value] = checkbox;
        this.radioGroup.addControl(checkbox.value, new FormControl({value: '', disabled: !this.questionComponent.editable}));
      });
    }

    if (this.edit()) {
      this._addToForm();
      this.autosaveContext?.registerQuestion(this);
    } else {
      this.autosaveContext?.removeQuestion(this);
    }

    QuestionViewUtils.setExistingAnswer(this);
  }

  removeFromForm(): void {
    if (this.questionComponent) {
      this.form.removeControl(this.questionComponent.name);
      this.radioGroup = undefined;
      this.autosaveContext?.removeQuestion(this);
    }
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

  emit(autosave: boolean, emitChange: boolean = true): void {
    const e = new QuestionChangeEvent(this.component.componentId, this, autosave);
    
    if (emitChange)
      this.questionChange.emit(e);

    this.autosaveContext?.notifyQuestionChange(e);
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

    this.emit(true);
  }

  display(): boolean {
    return QuestionViewUtils.display(this);
  }

  edit(): boolean {
    return QuestionViewUtils.edit(this, true, this.context?.viewingUser);
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
      this.emit(false, false);
    }
  }

  value(): Answer {
    return new Answer(undefined, this.component.componentId, this.selectedRadioValue, ValueType.OPTIONS, undefined);
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
      this.radioGroup.disable();
    } else {
      this.radioGroup.enable();
    }

    this.disableRadios = disabled;
  }

  markRequired(): void {
    if (!this.radioGroup?.hasValidator(this.validator)) {
      this.radioGroup.addValidators(this.validator);
      this.form.updateValueAndValidity();
    }
  }

  requiredValidator(): ValidatorFn {
    return RadioValidator(this);
  }
}
