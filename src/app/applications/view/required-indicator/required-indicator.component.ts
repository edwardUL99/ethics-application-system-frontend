import { Component, Input, OnInit } from '@angular/core';
import { ApplicationStatus } from '../../models/applications/applicationstatus';
import { QuestionComponent } from '../../models/components/questioncomponent';
import { resolveStatus } from '../../models/requests/mapping/applicationmapper';
import { QuestionViewComponent } from '../component/application-view.component';

/**
 * This component marks a question as being referred and/or requiring edits
 */
@Component({
  selector: 'app-required-indicator',
  templateUrl: './required-indicator.component.html',
  styleUrls: ['./required-indicator.component.css']
})
export class RequiredIndicatorComponent implements OnInit {
  /**
   * The component being indicated as referred/required
   */
  @Input() component: QuestionViewComponent;
  /**
   * Indicates if the component is indeed referred
   */
  referred: boolean;
  /**
   * Indicates if the component is required
   */
  required: boolean;
  /**
   * The tooltip text
   */
  tooltip: string;
  /**
   * The message to display beside the red asterisk
   */
  message: string;

  constructor() { }

  ngOnInit(): void {
    const id = this.component.component.componentId;
    const applicant = this.component.context?.viewingUser?.applicant;
    const status = resolveStatus(this.component.application.status);

    if (applicant) {
      const editable = this.component.application.editableFields;

      if (status == ApplicationStatus.REFERRED) {
        this.referred = editable && editable.indexOf(id) != -1 && applicant;

        if (this.referred) {
          this.component.castComponent().required = true;
          this.component.markRequired();
        }
        
        this.tooltip = 'This question has been referred back to you for more information by the committee';
        this.message = 'Requires additional input';
      } else if (status == ApplicationStatus.DRAFT) {
        const questionComponent: QuestionComponent = this.component.castComponent();
        this.required = questionComponent.required && questionComponent.editable;
        this.tooltip = 'This question requires input';
        this.message = '';
      }
    }
  }
}
