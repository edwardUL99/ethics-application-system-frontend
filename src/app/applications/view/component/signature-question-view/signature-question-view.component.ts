import { Component, ElementRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Application } from '../../../models/applications/application';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { SignatureQuestionComponent } from '../../../models/components/signaturequestioncomponent';
import { QuestionChange, QuestionViewComponent, QuestionViewComponentShape, QuestionChangeEvent, ViewComponentShape } from '../application-view.component';
import { ViewComponentRegistration } from '../registered.components';
import { SignatureFieldComponent } from './signature-field/signature-field.component';
import { Answer, ValueType } from '../../../models/applications/answer';
import { QuestionViewUtils } from '../questionviewutils';

@Component({
  selector: 'app-signature-question-view',
  templateUrl: './signature-question-view.component.html',
  styleUrls: ['./signature-question-view.component.css']
})
@ViewComponentRegistration(ComponentType.SIGNATURE)
export class SignatureQuestionViewComponent implements OnInit, QuestionViewComponent {
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

    if (this.form && !this.form.get(this.questionComponent.name)) {
      this._addToForm();
    }

    QuestionViewUtils.setExistingAnswer(this);
  }

  private _addToForm() {
    const control = new FormControl('', Validators.required);
    this.form.addControl(this.questionComponent.name, control);
  }

  addToForm(): void {
    if (!this.form.get(this.questionComponent.name)) {
      this._addToForm();
    }
  }

  removeFromForm(): void {
    this.form.removeControl(this.questionComponent.name);
  }

  sizeChange() {
    this.resizeSignature();
  }

  private resizeSignature() {
    this.signatureFieldComponent.signaturePad.set('canvasWidth', this.signatureContainer.nativeElement.clientWidth);
    this.signatureFieldComponent.signaturePad.set('canvasHeight', this.signatureContainer.nativeElement.clientHeight);
  }

  castComponent() {
    return this.component as SignatureQuestionComponent;
  }

  private _emit() {
    this.questionChange.emit(new QuestionChangeEvent(this.component.componentId, this));
  }

  signatureEntered(signature: string) {
    this.signature = signature;
    this._emit();
  }

  display(): boolean {
    return QuestionViewUtils.display(this);
  }

  edit(): boolean {
    return QuestionViewUtils.edit(this);
  }

  setFromAnswer(answer: Answer): void {
    if (answer.valueType != ValueType.IMAGE) {
      throw new Error('Invalid answer type for signature question');
    }

    this.signatureFieldComponent.signaturePad.fromDataURL(answer.value);

    this._emit();
  }

  value(): Answer {
    return new Answer(undefined, this.component.componentId, this.signature, ValueType.IMAGE);
  }
}
