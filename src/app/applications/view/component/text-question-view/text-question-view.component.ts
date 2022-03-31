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
import { AutosaveContext } from '../autosave';
import { AutofillNotifier } from '../../../autofill/autofillnotifier';
import { ApplicationStatus } from '../../../models/applications/applicationstatus';
import { resolveStatus } from '../../../models/requests/mapping/applicationmapper';

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
  @Input() template: ApplicationTemplateDisplayComponent;
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
  /**
   * The context for autosaving
   */
  autosaveContext: AutosaveContext;
  /**
   * The notifier of autofill events
   */
  private autofillNotifier: AutofillNotifier;

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

    this.autosaveContext = questionData.autosaveContext;
  }

  ngOnInit(): void {
    this.questionComponent = this.castComponent();

    this.addToForm();
    this.autofill();

    QuestionViewUtils.setExistingAnswer(this, this.template?.viewingUser);
  }

  ngOnDestroy(): void {
    this.questionChange.destroy();
    this.autofillNotifier?.detach(this);
    this.removeFromForm();
  }

  private _addToForm(): void {
    this.control = (this.control) ? this.control:new FormControl({value: '', disabled: !this.questionComponent.editable});

    if (this.edit()) {
      // only add to form if it is to be edited
      if (this.questionComponent.questionType == 'email' && !this.control.hasValidator(Validators.email)) {
        this.control.setValidators(Validators.email);
      } 

      if (this.questionComponent.required && !this.control.hasValidator(Validators.required)) {
        this.control.addValidators(Validators.required);
      }

      if (!this.form.get(this.questionComponent.name)) {
        this.form.addControl(this.questionComponent.name, this.control);
      }
    }
  }

  addToForm(): void {
    this._addToForm();
    this.autosaveContext?.registerQuestion(this);
  }

  removeFromForm(): void {
    this.control = undefined;
    this.form.removeControl(this.questionComponent.name);
    this.autosaveContext?.removeQuestion(this);
  }

  castComponent() {
    return this.component as TextQuestionComponent;
  }

  emit(autosave: boolean): void {
    const e = new QuestionChangeEvent(this.component.componentId, this, autosave);
    this.questionChange.emit(e);
    this.autosaveContext?.notifyQuestionChange(e);
  }

  onChange() {
    this.emit(true);
  }

  private parseAutofillValue(value: any): string {
    // parse for text-question
    if (value instanceof Date) {
      let str = `${value.getFullYear()}-${value.getMonth() + 1}-${value.getUTCDate()}`

      return str;
    } else {
      return value;
    }
  }

  autofill(): void {
    if (this.questionComponent.autofill) {
      if (!this.autofillNotifier) {
        throw new Error('registerAutofill not implemented or not called');
      }

      const resolver = getResolver();
      resolver.resolve(this.questionComponent.autofill).retrieveValue(value => {
        if (value && (resolveStatus(this.application.status) == ApplicationStatus.DRAFT || !(this.questionComponent.componentId in this.application.answers))) {
          value = this.parseAutofillValue(value);
          this.control.setValue(value, {emitEvent: false});
          this.emit(false);
          this.autofillNotifier.notify(this);
        }
      });
    }
  }

  registerAutofill(notifier: AutofillNotifier) {
    notifier.attach(this);
    this.autofillNotifier = notifier;
  }

  display(): boolean {
    return QuestionViewUtils.display(this);
  }

  edit(): boolean {
    return QuestionViewUtils.edit(this, true, this.template?.viewingUser);
  }
  
  setFromAnswer(answer: Answer): void {
    if (this.questionComponent.questionType == 'text' && answer.valueType != ValueType.TEXT) {
      throw new Error('Invalid answer type for text question');
    } else if (this.questionComponent.questionType == 'number' && answer.valueType != ValueType.NUMBER) {
      throw new Error('Invalid answer type for number question');
    }

    this.control.setValue(answer.value, {emitEvent: false});
    this.control.markAsTouched();
    this.emit(false);
  }

  value(): Answer {
    if (this.control) {
      return new Answer(undefined, this.component.componentId, this.control.value, 
        (this.questionComponent.questionType == 'number') ? ValueType.NUMBER : ValueType.TEXT);
    } else {
      return undefined;
    }
  }

  isVisible(): boolean {
    return this.visible;
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
  }

  displayAnswer(): boolean {
    const display = this.questionComponent?.componentId in this.application?.answers;
    this.visible = display;

    return display;
  }
}
