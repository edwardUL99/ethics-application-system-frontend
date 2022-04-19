import { AfterViewInit, Component, ElementRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Application } from '../../../models/applications/application';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { SignatureQuestionComponent } from '../../../models/components/signaturequestioncomponent';
import { QuestionChange, QuestionViewComponent, QuestionViewComponentShape, QuestionChangeEvent, ViewComponentShape } from '../application-view.component';
import { ComponentViewRegistration } from '../registered.components';
import { SignatureFieldComponent } from './signature-field/signature-field.component';
import { Answer, ValueType } from '../../../models/applications/answer';
import { QuestionViewUtils } from '../questionviewutils';
import { AutosaveContext } from '../autosave';
import { ComponentDisplayContext } from '../displaycontext';

/**
 * The copied signature
 */
let copiedSignature: string = undefined;

@Component({
  selector: 'app-signature-question-view',
  templateUrl: './signature-question-view.component.html',
  styleUrls: ['./signature-question-view.component.css']
})
@ComponentViewRegistration(ComponentType.SIGNATURE)
export class SignatureQuestionViewComponent implements OnInit, QuestionViewComponent, AfterViewInit {
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
  questionComponent: SignatureQuestionComponent;
  /**
   * The current application object
   */
  @Input() application: Application;
  /**
   * The component containing the signature
   */
  @ViewChild(SignatureFieldComponent)
  signatureFieldComponent: SignatureFieldComponent;
  /**
   * The container holding the signature
   */
  @ViewChild('signatureContainer')
  signatureContainer: ElementRef;
  /**
   * The form passed into the view component
   */
  @Input() form: FormGroup;
  /**
   * The question change event
   */
  @Output() questionChange: QuestionChange = new QuestionChange();
  /**
   * The entered signature
   */
  signature: string;
  /**
   * The form control for this component
   */
  control: FormControl;
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
   * Determines if the component has been disabled
   */
  disabled: boolean;
  /**
   * A width override
   */
  definedWidth: number;
  /**
   * Determines if the view has been initialised
   */
  private viewInitialised: boolean;

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
    this.addToForm();
  }

  ngAfterViewInit(): void {
    QuestionViewUtils.setExistingAnswer(this);

    if (this.signatureFieldComponent) {
      this.resizeSignature();
    }

    this.viewInitialised = true;
  }

  ngOnDestroy(): void {
    this.questionChange.destroy();
    this.removeFromForm();
  }

  private _addToForm() {
    if (this.questionComponent.required && !this.control.hasValidator(Validators.required)) {
      this.control.addValidators(Validators.required);
    }

    if (!this.form.get(this.questionComponent.name)) {
      this.form.addControl(this.questionComponent.name, this.control);
    }

    this.control.updateValueAndValidity({emitEvent: false});
  }

  addToForm(): void {
    this.questionComponent = this.castComponent();
    this.control = (this.control) ? this.control:new FormControl({value: '', disabled: !this.questionComponent.editable});

    if (this.edit()) {
      this._addToForm();
      this.autosaveContext?.registerQuestion(this);
    } else {
      this.autosaveContext?.removeQuestion(this);
    }

    if (this.viewInitialised) {
      QuestionViewUtils.setExistingAnswer(this);
    }
  }

  removeFromForm(): void {
    if (this.questionComponent) {
      this.control = undefined;
      this.form.removeControl(this.questionComponent.name);
      this.autosaveContext?.removeQuestion(this);
    }
  }

  sizeChange() {
    if (this.signatureFieldComponent) {
      this.resizeSignature();
    }
  }

  private getMaxParentWidth() {
    if (this.parent && typeof(this.parent.maxWidth) === 'function') {
      return this.parent.maxWidth();
    } else {
      return -1;
    }
  }

  private resizeSignature() {
    if (this.signatureContainer && this.signatureFieldComponent) {
      let offsetWidth = this.signatureContainer.nativeElement.offsetWidth;
      let maxWidth = this.getMaxParentWidth();
      let size: number;

      if (maxWidth == -1) {
        size = offsetWidth;
        maxWidth = undefined;
      } else {
        maxWidth += (maxWidth * 0.35);
        size = maxWidth;
      }

      this.signatureFieldComponent.resize(size, 100, maxWidth);
    }
  }

  clear() {
    this.signatureFieldComponent.clear();
    this.control.setValue('', {emitEvent: false});
    this.signatureEntered('');
  }

  castComponent() {
    return this.component as SignatureQuestionComponent;
  }

  emit(autosave: boolean, emitChange: boolean = true): void {
    const e = new QuestionChangeEvent(this.component.componentId, this, autosave);
    
    if (emitChange)
      this.questionChange.emit(e);

    this.autosaveContext?.notifyQuestionChange(e);
  }

  drawStarted() {
    this.control.markAsTouched();
  }

  signatureEntered(signature: string) {
    this.signature = signature;
    this.emit(true);
  }

  display(): boolean {
    return QuestionViewUtils.display(this);
  }

  edit(): boolean {
    return QuestionViewUtils.edit(this, true, this.context?.viewingUser);
  }

  setFromAnswer(answer: Answer): void {
    if (answer.valueType != ValueType.IMAGE) {
      throw new Error('Invalid answer type for signature question');
    }

    this.signature = answer.value;
    this.resizeSignature();
    this.control.setValue(this.signature, {emitEvent: false});
    this.control.markAsTouched();
    this.emit(false, false);
  }

  value(): Answer {
    return new Answer(undefined, this.component.componentId, this.signature, ValueType.IMAGE, undefined);
  }

  copy() {
    copiedSignature = this.signature;
  }

  paste() {
    if (copiedSignature) {
      this.resizeSignature();
      this.control.setValue(copiedSignature);
      this.signature = copiedSignature;
      delete this.control.errors?.['required'];
      this.emit(true);
    }
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
    this.disabled = disabled;

    if (disabled) {
      this.form
      this.control.disable();
    } else {
      this.control.enable();
    }
  }

  defineWidth(width: number) {
    this.definedWidth = width;
  }

  markRequired(): void {
    if (!this.control?.hasValidator(Validators.required)) {
      this.control.addValidators(Validators.required);
      this.form.updateValueAndValidity();
    }
  }
}
