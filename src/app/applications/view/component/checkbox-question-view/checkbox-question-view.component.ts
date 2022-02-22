import { Component, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Checkbox } from '../../../models/components/checkboxgroupcomponent';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { CheckboxQuestionComponent } from '../../../models/components/checkboxquestioncomponent';
import { QuestionChange, QuestionViewComponent, QuestionViewComponentShape, QuestionChangeEvent, ViewComponentShape } from '../application-view.component';
import { CheckboxMapping, CheckboxSelection } from '../checkbox-group-view/checkbox-group-view.component';
import { ViewComponentRegistration } from '../registered.components';
import { Application } from '../../../models/applications/application';
import { Answer, ValueType } from '../../../models/applications/answer';
import { QuestionViewUtils } from '../questionviewutils';


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
  /**
   * The css clas for checkboxes
   */
  checkClass: string;

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
    this.checkClass = (this.questionComponent.inline) ? 'form-check form-check-inline' : 'form-check';
    this.addToForm();
    this.questionComponent.options.forEach(option => {
      const checkbox = new Checkbox(option.id, option.label, option.identifier, null);
      this.checkboxes[option.identifier] = checkbox;

      this.selectedCheckboxes[checkbox.identifier] = false;
      this.checkboxControls[checkbox.identifier] = new FormControl('');
    });

    QuestionViewUtils.setExistingAnswer(this);
  }

  ngOnDestroy(): void {
    this.questionChange.destroy();
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
    if (this.edit() && !this.form.get(this.questionComponent.componentId)) {
      this._addToForm();
    }
  }

  removeFromForm(): void {
    this.form.removeControl(this.questionComponent.componentId);
  }

  castComponent() {
    return this.component as CheckboxQuestionComponent;
  }

  private _emit() {
    this.questionChange.emit(new QuestionChangeEvent(this.component.componentId, this));
  }

  private select(checkbox: string) {
    this.selectedCheckboxes[checkbox] = true;
      
    const control = this.checkboxControls[checkbox];
    control.setValue(checkbox, {emitEvent: false})
    this.checkboxArray.push(control);
  }

  /**
   * Responds to a checkbox group selected
   * @param event the event
   */
  onCheckChange(event) {
    if (event.target.checked) {
      this.select(event.target.value);
    } else {
      let i = 0;
      
      this.selectedCheckboxes[event.target.value] = false;
      this.checkboxArray.controls.forEach(control => {
        if (control.value == event.target.value) {
          this.checkboxArray.removeAt(i);
          control.setValue('', {emitEvent: false})
          return;
        }

        i++;
      });
    }

    this._emit();
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

    this.checkboxArray.markAsTouched();

    this._emit();
  }

  value(): Answer {
    const options = Object.keys(this.selectedCheckboxes)
      .filter(key => this.selectedCheckboxes[key]).join(',');

    return new Answer(undefined, this.component.componentId, options, ValueType.OPTIONS);
  }
}
