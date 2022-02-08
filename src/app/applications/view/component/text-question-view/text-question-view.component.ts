import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { TextQuestionComponent } from '../../../models/components/textquestioncomponent';
import { ApplicationViewComponent } from '../application-view.component';
import { ViewComponentRegistration } from '../registered.components';

@Component({
  selector: 'app-text-question-view',
  templateUrl: './text-question-view.component.html',
  styleUrls: ['./text-question-view.component.css']
})
@ViewComponentRegistration(ComponentType.TEXT_QUESTION)
export class TextQuestionViewComponent implements OnInit, ApplicationViewComponent {
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

  constructor() { 
    this.questionComponent = this.castComponent();
  }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    if (this.form && !this.form.get(this.questionComponent.name)) {
      this.control = new FormControl('');

      if (this.questionComponent.questionType == 'email') {
        this.control.addValidators(Validators.email);
      } 

      if (this.questionComponent.required) {
        this.control.addValidators(Validators.required);
      }

      this.form.addControl(this.questionComponent.name, this.control);
    }
  }

  castComponent() {
    return this.component as TextQuestionComponent;
  }
}
