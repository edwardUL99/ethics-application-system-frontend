import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { SelectQuestionComponent } from '../../../models/components/selectquestioncomponent';
import { ApplicationViewComponent } from '../application-view.component';
import { ViewComponentRegistration } from '../registered.components';

@Component({
  selector: 'app-select-question-view',
  templateUrl: './select-question-view.component.html',
  styleUrls: ['./select-question-view.component.css']
})
@ViewComponentRegistration(ComponentType.SELECT_QUESTION)
export class SelectQuestionViewComponent implements OnInit, ApplicationViewComponent {
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

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    this.questionComponent = this.castComponent();

    if (this.form && !this.form.get(this.questionComponent.name)) {
      this.control = new FormControl('');

      if (this.questionComponent.required) {
        this.control.addValidators(Validators.required);
      }

      this.form.addControl(this.questionComponent.name, this.control);
    }
  }

  castComponent() {
    return this.component as SelectQuestionComponent;
  }
}
