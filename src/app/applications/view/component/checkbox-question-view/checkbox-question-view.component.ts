import { Component, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { Checkbox } from '../../../models/components/checkboxgroupcomponent';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { CheckboxQuestionComponent } from '../../../models/components/checkboxquestioncomponent';
import { QuestionChange, QuestionViewComponent, QuestionViewComponentShape, QuestionChangeEvent, ViewComponentShape } from '../application-view.component';
import { CheckboxMapping, CheckboxSelection } from '../checkbox-group-view/checkbox-group-view.component';
import { ComponentViewRegistration } from '../registered.components';
import { Application } from '../../../models/applications/application';
import { Answer, ValueType } from '../../../models/applications/answer';
import { QuestionViewUtils } from '../questionviewutils';
import { CheckboxGroupRequired } from '../../../../validators';
import { AutosaveContext } from '../autosave';
import { ComponentDisplayContext } from '../displaycontext';


@Component({
  selector: 'app-checkbox-question-view',
  templateUrl: './checkbox-question-view.component.html',
  styleUrls: ['./checkbox-question-view.component.css']
})
@ComponentViewRegistration(ComponentType.CHECKBOX_QUESTION)
export class CheckboxQuestionViewComponent implements OnInit, QuestionViewComponent {
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
  form: FormGroup;
  /**
   * The group of checkboxes
   */
  checkboxGroup: FormGroup;
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
  /**
   * The css clas for checkboxes
   */
  checkClass: string;
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
   * Validator for this component
   */
  private readonly validator = CheckboxGroupRequired();

  constructor() {}

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
    this.checkClass = (this.questionComponent.inline) ? 'form-check form-check-inline' : 'form-check';
    this.addToForm();
  }

  ngOnDestroy(): void {
    this.questionChange.destroy();
    this.removeFromForm();
  }

  getCheckboxes() {
    const checkboxList = [];
    Object.keys(this.checkboxes).forEach(key => checkboxList.push(this.checkboxes[key]));

    return checkboxList;
  }

  private _addToForm(): void {
    if (this.questionComponent.required) {
      this.checkboxGroup.addValidators(this.validator);
    }

    if (!this.form.get(this.questionComponent.name)) {
      this.form.addControl(this.questionComponent.name, this.checkboxGroup);
    }
  }

  addToForm(): void {
    this.questionComponent = this.castComponent();
    const newCheckboxGroup = !this.checkboxGroup;
    this.checkboxGroup = (!newCheckboxGroup) ? this.checkboxGroup:new FormGroup({});

    if (newCheckboxGroup || Object.keys(this.checkboxes).length == 0) {
      this.questionComponent.options.forEach(option => {
        const checkbox = new Checkbox(option.id, option.label, option.identifier, null, option.value);
        this.checkboxes[option.identifier] = checkbox;
  
        this.selectedCheckboxes[checkbox.identifier] = false;
  
        this.checkboxGroup.addControl(checkbox.identifier, new FormControl({value: '', disabled: !this.questionComponent.editable}));
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
      Object.keys(this.selectedCheckboxes).forEach(key => {
        this.selectedCheckboxes[key] = false;
      });
      this.form.removeControl(this.questionComponent.name);
      this.checkboxGroup = undefined;
      this.autosaveContext?.removeQuestion(this);
    }
  }

  castComponent() {
    return this.component as CheckboxQuestionComponent;
  }

  emit(autosave: boolean, emitChange: boolean = true): void {
    const e = new QuestionChangeEvent(this.component.componentId, this, autosave);
    
    if (emitChange)
      this.questionChange.emit(e);

    this.autosaveContext?.notifyQuestionChange(e);
  }

  private select(checkbox: string) {
    this.selectedCheckboxes[checkbox] = true;
      
    const control = this.checkboxGroup.get(checkbox);
    control.setValue(checkbox, {emitEvent: false});
  }

  /**
   * Responds to a checkbox group selected
   * @param event the event
   */
  onCheckChange(event) {
    if (event.target.checked) {
      this.select(event.target.value);
    } else {
      this.selectedCheckboxes[event.target.value] = false;
      this.checkboxGroup.get(event.target.value).setValue('', {emitEvent: false});
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
    if (answer.valueType != ValueType.OPTIONS) {
      throw new Error('Invalid answer type for a radio question component');
    }

    if (answer.value != '') {
      answer.value.split(',').forEach(option => {
        const value = (option.includes('=')) ? option.split('=')[0]:option;
        this.select(value);
      });

      this.checkboxGroup.markAsTouched();
      this.emit(false, false);
    }
  }

  value(): Answer {
    const options = [];

    for (let key of Object.keys(this.selectedCheckboxes)) {
      if (this.selectedCheckboxes[key]) {
        const checkbox = this.checkboxes[key];

        if (checkbox.value) {
          options.push(`${key}=${checkbox.value}`);
        } else {
          options.push(key);
        }
      }
    }

    return new Answer(undefined, this.component.componentId, options.join(','), ValueType.OPTIONS, undefined);
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
      this.checkboxGroup.disable();
    } else {
      this.checkboxGroup.enable();
    }
  }

  markRequired(): void {
    if (!this.checkboxGroup?.hasValidator(this.validator)) {
      this.checkboxGroup.addValidators(this.validator);
      this.form.updateValueAndValidity();
    }
  }
  
  requiredValidator(): ValidatorFn {
    return CheckboxGroupRequired();
  }
}
