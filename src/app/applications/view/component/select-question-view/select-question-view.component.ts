import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { SelectQuestionComponent } from '../../../models/components/selectquestioncomponent';
import { QuestionViewComponent, QuestionViewComponentShape, QuestionViewEvent, ViewComponentShape } from '../application-view.component';
import { ViewComponentRegistration } from '../registered.components';
import { ArrayValueType, StringValueType, ValueType } from '../valuetype';

@Component({
  selector: 'app-select-question-view',
  templateUrl: './select-question-view.component.html',
  styleUrls: ['./select-question-view.component.css']
})
@ViewComponentRegistration(ComponentType.SELECT_QUESTION)
export class SelectQuestionViewComponent implements OnInit, QuestionViewComponent {
  /**
   * The component being rendered by the view
   */
  @Input() component: ApplicationComponent;
  /**
   * The form passed to this component
   */
  @Input() form: FormGroup;
  /**
   * The cast component
   */
  questionComponent: SelectQuestionComponent;
  /**
   * The form control representing the select question
   */
  control: FormControl;
  /**
   * The question change event emitter
   */
  @Output() questionChange: EventEmitter<QuestionViewEvent>;

  constructor() { }

  initialise(data: ViewComponentShape): void {
    const questionData = data as QuestionViewComponentShape;
    this.component = questionData.component;
    this.form = questionData.form;
  }

  ngOnInit(): void {
    this.questionComponent = this.castComponent();
    this.addToForm();
  }

  addToForm(): void {
    if (!this.form.get(this.questionComponent.name)) {
      this.control = (this.control) ? this.control:new FormControl('');

      if (this.questionComponent.required && !this.control.hasValidator(Validators.required)) {
        this.control.addValidators(Validators.required);
      }

      this.form.addControl(this.questionComponent.name, this.control);
    }
  }

  removeFromForm(): void {
    this.form.removeControl(this.questionComponent.name);
  }

  castComponent() {
    return this.component as SelectQuestionComponent;
  }

  value(): ValueType {
    if (this.questionComponent.multiple) {
      return new ArrayValueType(this.control?.value);
    } else {
      return new StringValueType(this.control?.value);
    }
  }

  onChange() {
    this.questionChange.emit(new QuestionViewEvent(this.component.componentId, this.value()));
  }
}
