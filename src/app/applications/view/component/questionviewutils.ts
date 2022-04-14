import { ViewingUser } from '../../applicationcontext';
import { ApplicationStatus } from '../../models/applications/applicationstatus';
import { resolveStatus } from '../../models/requests/mapping/applicationmapper';
import { QuestionViewComponent } from './application-view.component';

/**
 * This class represents utilities for providing common functionality for question view components
 */
export class QuestionViewUtils {
  /**
   * Set the answer of this component from the given application and component if it is draft or 
   * referred and can be edited
   */
  public static setExistingAnswer(view: QuestionViewComponent, viewingUser: ViewingUser) {
    if ((view.setAnswerOnNoEdit ||this.edit(view, true, viewingUser)) && view?.application?.answers && view?.component?.componentId in view?.application?.answers) {
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
    return view.context?.displayComponent(view) && ((checkParent && view.parent?.display()) || view.displayNoAnswer || 
      (view.application.status == ApplicationStatus.DRAFT || view.application.status == ApplicationStatus.REFERRED
      || view.component.componentId in view.application.answers || (view.context?.application?.editableFields && view.component.componentId in view.context?.application?.editableFields)));
  }

  /**
   * This function includes common code to determine if a view can be edited
   * @param view the view component
   * @param checkParent if parent exists, check if the parent edit() is true and if so, return true straight away
   * @param viewingUser the viewing user
   * @returns true if it can be edited, false if not
   */
  public static edit(view: QuestionViewComponent, checkParent: boolean = true, viewingUser: ViewingUser): boolean {
    // determine if the question is editable
    return view.context?.displayAndDisableComponent(view) || ((!viewingUser || viewingUser.applicant || viewingUser.givingInput) && ((checkParent && view.parent?.edit()) || (view.application.status == ApplicationStatus.DRAFT || 
      (view.application.status == ApplicationStatus.REFERRED && view.application.editableFields.indexOf(view.component.componentId) != -1))));
  }

  /**
   * A utility to determine if an answer should be displayed and it also sets the visible attribute accordingly
   * @param view the view to determine to display answer for
   * @returns true to display answer, false if not
   */
  public static displayAnswer(view: QuestionViewComponent) {
    const display = view.component?.componentId in view.application?.answers;
    const status = resolveStatus(view.application?.status);

    if (status != ApplicationStatus.DRAFT && (status != ApplicationStatus.REFERRED || !view.edit())) {
      view.setVisible(display);
    }

    return display;
  }
}