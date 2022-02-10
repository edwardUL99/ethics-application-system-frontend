import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { SignatureQuestionComponent } from '../../../models/components/signaturequestioncomponent';
import { QuestionViewComponent, QuestionViewComponentShape, QuestionViewEvent, ViewComponentShape } from '../application-view.component';
import { ViewComponentRegistration } from '../registered.components';
import { StringValueType, ValueType } from '../valuetype';
import { SignatureFieldComponent } from './signature-field/signature-field.component';

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
   * The cast component
   */
  questionComponent: SignatureQuestionComponent;
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
  @Output() questionChange: EventEmitter<QuestionViewEvent>;
  /**
   * The entered signature
   */
  signature: string;

  constructor() { }

  initialise(data: ViewComponentShape): void {
    const questionData = data as QuestionViewComponentShape;
    this.component = questionData.component;
    this.form = questionData.form;
  }

  ngOnInit(): void {
    this.questionComponent = this.castComponent();

    if (this.form && !this.form.get(this.questionComponent.name)) {
      this._addToForm();
    }
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

  value(): ValueType {
    return new StringValueType(this.signature);
  }

  castComponent() {
    return this.component as SignatureQuestionComponent;
  }

  signatureEntered(signature: string) {
    console.log(signature);
    this.signature = signature;
  }
}
