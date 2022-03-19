import { AfterViewInit, Component, ElementRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Application } from '../../../models/applications/application';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { SignatureQuestionComponent } from '../../../models/components/signaturequestioncomponent';
import { QuestionChange, QuestionViewComponent, QuestionViewComponentShape, QuestionChangeEvent, ViewComponentShape } from '../application-view.component';
import { ComponentViewRegistration } from '../registered.components';
import { SignatureFieldComponent } from './signature-field/signature-field.component';
import { Answer, ValueType } from '../../../models/applications/answer';
import { QuestionViewUtils } from '../questionviewutils';
import { AutosaveContext } from '../autosave';

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
  @Input() visible: boolean;
  /**
   * The context for autosaving
   */
  autosaveContext: AutosaveContext;

  constructor() {}

  initialise(data: ViewComponentShape): void {
    const questionData = data as QuestionViewComponentShape;
    this.component = questionData.component;
    this.parent = questionData.parent;
    this.application = data.application;
    this.form = questionData.form;
    this.autosaveContext = questionData.autosaveContext;

    if (questionData.questionChangeCallback) {
      this.questionChange.register(questionData.questionChangeCallback);
    }
  }

  ngOnInit(): void {
    this.questionComponent = this.castComponent();
    this.addToForm();
  }

  ngAfterViewInit(): void {
    QuestionViewUtils.setExistingAnswer(this);

    if (this.signatureFieldComponent) {
      this.resizeSignature();
    }
  }

  ngOnDestroy(): void {
    this.questionChange.destroy();
    this.removeFromForm();
  }

  private _addToForm() {
    this.control = (this.control) ? this.control:new FormControl({value: '', disabled: !this.questionComponent.editable}, Validators.required);
    
    if (!this.control.hasValidator(Validators.required)) {
      this.control.addValidators(Validators.required);
    }

    if (!this.form.get(this.questionComponent.name)) {
      this.form.addControl(this.questionComponent.name, this.control);
    }

    this.control.updateValueAndValidity({emitEvent: false});
  }

  addToForm(): void {
    if (this.edit()) {
      this._addToForm();
      this.autosaveContext?.registerQuestion(this);
    }
  }

  removeFromForm(): void {
    this.control = undefined;
    this.form.removeControl(this.questionComponent.name);
    this.autosaveContext?.removeQuestion(this);
  }

  sizeChange() {
    if (this.signatureFieldComponent) {
      this.resizeSignature();
    }
  }

  private resizeSignature() {
    // TODO this doesn't work that well in table questions. Fix
    this.signatureFieldComponent.signaturePad.set('canvasWidth', this.signatureContainer.nativeElement.offsetWidth);
    this.signatureFieldComponent.signaturePad.set('canvasHeight', 100);
    //this.signatureFieldComponent.signaturePad.set('backgroundColor', 'rgb(255, 255, 255)');
    this.signatureFieldComponent.signaturePad.clear();
    
    if (this.signature) {
      this.signatureFieldComponent.signaturePad.redrawCanvas();
      this.signatureFieldComponent.signaturePad.fromDataURL(this.signature);
    }
  }

  clear() {
    this.signatureFieldComponent.clear();
    this.signatureEntered('');
  }

  castComponent() {
    return this.component as SignatureQuestionComponent;
  }

  emit(autosave: boolean) {
    const e = new QuestionChangeEvent(this.component.componentId, this, autosave);
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
    return QuestionViewUtils.edit(this);
  }

  setFromAnswer(answer: Answer): void {
    // TODO this isn't working, answer doesn't get set. check if its even being saved in the first place

    if (answer.valueType != ValueType.IMAGE) {
      throw new Error('Invalid answer type for signature question');
    }

    this.signature = answer.value;
    //this.signatureFieldComponent.signaturePad.fromDataURL(this.signature);
    this.resizeSignature();
    this.control.setValue(this.signature, {emitEvent: false});
    this.control.markAsTouched();

    this.emit(false);
  }

  value(): Answer {
    return new Answer(undefined, this.component.componentId, this.signature, ValueType.IMAGE);
  }

  copy() {
    copiedSignature = this.signature;
  }

  paste() {
    if (copiedSignature) {
      this.resizeSignature();
      this.signatureFieldComponent.signaturePad.fromDataURL(copiedSignature);
      this.signature = copiedSignature;
      delete this.control.errors['required'];
    }
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
