import { Component, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { TextQuestionComponent } from '../../../models/components/textquestioncomponent';
import { QuestionChange, QuestionViewComponent, QuestionViewComponentShape, QuestionChangeEvent, ViewComponentShape } from '../application-view.component'
import { ViewComponentRegistration } from '../registered.components';
import { StringValueType, ValueType } from '../valuetype';

@Component({
  selector: 'app-text-question-view',
  templateUrl: './text-question-view.component.html',
  styleUrls: ['./text-question-view.component.css']
})
@ViewComponentRegistration(ComponentType.TEXT_QUESTION)
export class TextQuestionViewComponent implements OnInit, QuestionViewComponent {
  /**
   * The component being rendered by this view
   */
  @Input() component: ApplicationComponent;
  /**
   * The cast component
   */
  questionComponent: TextQuestionComponent;
  /**
   * The form group the question is being added to
   */
  @Input() form: FormGroup;
  /**
   * The form control behind the text question view
   */
  control: FormControl;
  /**
   * The value change that occurred
   */
  @Output() questionChange: QuestionChange = new QuestionChange();

  constructor() {}

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

    if (this.form && !this.form.get(this.questionComponent.name)) {
      this._addToForm();
    }
  }

  private _addToForm(): void {
    this.control = (this.control) ? this.control:new FormControl('');

    if (this.questionComponent.questionType == 'email' && !this.control.hasValidator(Validators.email)) {
      this.control.setValidators(Validators.email);
    } 

    if (this.questionComponent.required && !this.control.hasValidator(Validators.required)) {
      this.control.addValidators(Validators.required);
    }

    this.form.addControl(this.questionComponent.name, this.control);
    this.control.updateValueAndValidity();
  }

  addToForm(): void {
    if (!this.form.get(this.questionComponent.name)) {
      this._addToForm();
    }
  }

  removeFromForm(): void {
    this.form.removeControl(this.questionComponent.name);
  }

  castComponent() {
    return this.component as TextQuestionComponent;
  }

  value(): ValueType  {
    return new StringValueType(this.control?.value);    
  }

  onChange() {
    this.questionChange.emit(new QuestionChangeEvent(this.component.componentId, this.value()));
  }
}
