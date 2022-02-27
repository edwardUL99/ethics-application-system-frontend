import { ApplicationStatus } from '../../models/applications/applicationstatus';
import { QuestionViewComponent } from './application-view.component';

/**
 * This class represents utilities for providing common functionality for question view components
 */
export class QuestionViewUtils {
  /**
   * Set the answer of this component from the given application and component if it is draft or 
   * referred and can be edited
   */
  public static setExistingAnswer(view: QuestionViewComponent) {
    if (this.edit(view) && view?.application?.answers && view?.component?.componentId in view?.application?.answers) {
      view.setFromAnswer(view.application.answers[view.component.componentId]);
    }
  }

  /**
   * This function includes common code to determine if a view can be displayed
   * @param view the view component
   * @param checkParent if parent exists, check if the parent display() is true and if so, return true straight away
   * @returns true to display it, false to not display it
   */
  public static display(view: QuestionViewComponent, checkParent: boolean = true): boolean {
    // determine if this component should be viewed at all based on the application status
    return (checkParent && view.parent?.display()) || (view.application.status == ApplicationStatus.DRAFT || view.application.status == ApplicationStatus.REFERRED
      || view.component.componentId in view.application.answers);
  }

  /**
   * This function includes common code to determine if a view can be edited
   * @param view the view component
   * @param checkParent if parent exists, check if the parent edit() is true and if so, return true straight away
   * @returns true if it can be edited, false if not
   */
  public static edit(view: QuestionViewComponent, checkParent: boolean = true): boolean {
    // determine if the question is editable
    return (checkParent && view.parent?.edit()) || (view.application.status == ApplicationStatus.DRAFT || 
      (view.application.status == ApplicationStatus.REFERRED && view.application.editableFields.indexOf(view.component.componentId) != -1));
  }
}