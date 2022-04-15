import { Application } from '../../models/applications/application';
import { ViewingUser } from '../../applicationcontext';
import { ActionBranchSource, AutosaveSource, QuestionChange, QuestionChangeEvent, QuestionViewComponent } from './application-view.component';
import { AutofillNotifier } from '../../autofill/autofillnotifier';
import { ReplacedContainer } from '../../applicationtemplatecontext';
import { QuestionComponent } from '../../models/components/questioncomponent';
import { RequestedAnswers } from '../answer-requests/requestedanswers';
import { EventEmitter } from '@angular/core';

/**
 * This interface represents an object that provides a context to all loaded application
 * components, for example, a template display component which renders an application template.
 * It loads all the components in the template, so it is a context.
 * 
 * Provides properties and methods to provide services to loaded components. It acts as the context in which the
 * component is loaded in. The context can be rendering the entire template or just a handful of components. Each method does not have
 * to be implemented, instead a no-op implementation can be provided if that context does not support it
 */
export interface ComponentDisplayContext {
  /**
   * The application that is associated with the context
   */
  application: Application;
  /**
   * This object represents the user viewing the context
   */
  viewingUser: ViewingUser;
  /**
   * Can be specified if the implementing context supports autofill
   */
  autofillNotifier?: AutofillNotifier;
  /**
   * An event emitter that emits true when requested answers are submitted
   */
  answerRequestSubmitted?: EventEmitter<boolean>;

  /**
   * This method provides the context to allow the component to accept a terminate action from the provided component source
   * @param component the component initiating the request
   */
  terminateApplication(component: ActionBranchSource): void;

  /**
   * This method provides the context to allow the component to accept an attach file request
   * @param component the component initiaiting the request
   */
  attachFileToApplication(component: ActionBranchSource): void;

  /**
   * Context for providing autosave service
   * @param source the source of the autosave event
   */
  autosave?(source: AutosaveSource): void;

  /**
   * Mark the autosave as completed
   * @param source the source to mark as saved
   */
  markAutosaved?(source: AutosaveSource): void;

  /**
   * Load a new container and remove the old container
   * @param replaced the container that's been replaced
   */
  loadNewContainer(replaced: ReplacedContainer): void;

  /**
   * This method propagates the given event out of the context. The question change can be the emitter
   * defined by the context and passed in
   * @param questionChange the question change emitter to propagate the event with
   * @param e the event to propagate
   */
  propagateQuestionChange(questionChange: QuestionChange, e: QuestionChangeEvent): void;

  /**
   * Determines if this context allows answers to be requested on the components in the context
   */
  answerRequestEnabled(): boolean;

  /**
   * If an answer is provided by another user and the application is Draft/Referred, allow another user to edit the provided answer
   */
  allowAnswerEdit(): boolean;

  /**
   * If answer requests are enabled, this can be called to emit an AnswerRequestedEvent from the context
   * @param component the component creating the request
   * @param username the username of the user the answer is requested from
   * @param remove if true, undo the request before it is sent
   */
  onAnswerRequested(component: QuestionComponent, username: string, remove?: boolean): void;

  /**
   * Get the requested answers provided by the context
   */
  getRequestedAnswers(): RequestedAnswers;

  /**
   * The component when being loaded should query this method to determine if
   * it should be displayed or not
   * @param component the component that should be displayed/not
   */
  displayComponent(component: QuestionViewComponent): boolean;

  /**
   * Based on the context, determine if the component should be displayed but just disabled
   * @param component the component to disable
   * @returns true to display, false otherwise
   */
  displayAndDisableComponent(component: QuestionViewComponent): boolean;
}