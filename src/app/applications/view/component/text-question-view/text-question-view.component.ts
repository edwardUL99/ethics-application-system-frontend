import { Component, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Application } from '../../../models/applications/application';
import { getResolver } from '../../../autofill/resolver';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { TextQuestionComponent } from '../../../models/components/textquestioncomponent';
import { QuestionChange, QuestionViewComponent, QuestionViewComponentShape, QuestionChangeEvent, ViewComponentShape } from '../application-view.component'
import { ComponentViewRegistration } from '../registered.components';
import { Answer, ValueType } from '../../../models/applications/answer';
import { QuestionViewUtils } from '../questionviewutils';
import { ApplicationTemplateDisplayComponent } from '../../application-template-display/application-template-display.component';

@Component({
  selector: 'app-text-question-view',
  templateUrl: './text-question-view.component.html',
  styleUrls: ['./text-question-view.component.css']
})
@ComponentViewRegistration(ComponentType.TEXT_QUESTION)
export class TextQuestionViewComponent implements OnInit, QuestionViewComponent {
  /**
   * The component being rendered by this view
   */
  @Input() component: ApplicationComponent;
  /**
   * The parent component if it exists
   */
  @Input() parent: QuestionViewComponent;
  /**
   * The cast component
   */
  questionComponent: TextQuestionComponent;
  /**
   * The template display component
   */
  template?: ApplicationTemplateDisplayComponent;
  /**
   * The current application object
   */
  @Input() application: Application;
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
    this.template = data.template;
    this.form = questionData.form;

    if (questionData.questionChangeCallback) {
      this.questionChange.register(questionData.questionChangeCallback);
    }
  }

  ngOnInit(): void {
    this.questionComponent = this.castComponent();

    if (this.form && !this.form.get(this.questionComponent.name)) {
      this._addToForm();
      this.autofill();
    }

    QuestionViewUtils.setExistingAnswer(this);
  }

  ngOnDestroy(): void {
    this.questionChange.destroy();
  }

  private _addToForm(): void {
    if (this.edit()) {
      // only add to form if it is to be edited
      this.control = (this.control) ? this.control:new FormControl({value: '', disabled: !this.questionComponent.editable});

      if (this.questionComponent.questionType == 'email' && !this.control.hasValidator(Validators.email)) {
        this.control.setValidators(Validators.email);
      } 

      if (this.questionComponent.required && !this.control.hasValidator(Validators.required)) {
        this.control.addValidators(Validators.required);
      }

      if (!this.form.get(this.questionComponent.name)) {
        this.form.addControl(this.questionComponent.name, this.control);
      }

      this.control.updateValueAndValidity();
    }
  }

  addToForm(): void {
    this._addToForm();
  }

  removeFromForm(): void {
    this.control.setValue('');
    this.control.clearValidators();
    this.control.updateValueAndValidity({emitEvent: false});
  }

  castComponent() {
    return this.component as TextQuestionComponent;
  }

  emit(): void {
    this.questionChange.emit(new QuestionChangeEvent(this.component.componentId, this));
  }

  onChange() {
    this.emit();
  }

  private _emit() {
    if (!this.parent) {
      this.emit();
    }
  }

  autofill(): void {
    if (this.questionComponent.autofill && this.edit()) {
      const resolver = getResolver();
      resolver.resolve(this.questionComponent.autofill).retrieveValue(value => {
        if (value) {
          this.control.setValue(value);
        }
      });
    }
  }

  display(): boolean {
    return QuestionViewUtils.display(this);
  }

  edit(): boolean {
    return QuestionViewUtils.edit(this);
  }
  
  setFromAnswer(answer: Answer): void {
    if (this.questionComponent.questionType == 'text' && answer.valueType != ValueType.TEXT) {
      throw new Error('Invalid answer type for text question');
    } else if (this.questionComponent.questionType == 'number' && answer.valueType != ValueType.NUMBER) {
      throw new Error('Invalid answer type for number question');
    }

    this.control.setValue(answer.value, {emitEvent: false});
    this.control.markAsTouched();
    this._emit();
  }

  value(): Answer {
    return new Answer(undefined, this.component.componentId, this.control.value, 
      (this.questionComponent.questionType == 'number') ? ValueType.NUMBER : ValueType.TEXT);
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
