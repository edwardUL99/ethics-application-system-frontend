import { OnDestroy } from '@angular/core';
import { FormGroup, ValidatorFn } from '@angular/forms';
import { TrackedEventEmitter } from '../../../utils';
import { AutofillNotifier } from '../../autofill/autofillnotifier';
import { Answer } from '../../models/applications/answer';
import { Application } from '../../models/applications/application';
import { ApplicationComponent } from '../../models/components/applicationcomponent';
import { AutosaveContext } from './autosave';
import { ComponentDisplayContext } from './displaycontext';

/**
 * This type represents a callback for when a question change event is fired
 */
export type QuestionChangeCallback = (e: QuestionChangeEvent) => void;

/**
 * This is a specialised EventEmitter class for registering QuestionChangeCallbacks
 */
export class QuestionChange extends TrackedEventEmitter<QuestionChangeEvent> {}

/**
 * This interface is essentially the ApplicationViewComponent interface but just with the properties required for initialisation
 */
export interface ViewComponentShape {
  /**
   * The component being rendered by this view
   */
  component: ApplicationComponent;
  /**
   * The application object representing the current application
   */
  application: Application;
  /**
   * The display context the view component is being rendered inside.
   */
  context: ComponentDisplayContext;
}

/**
 * The shape for a QuestionViewComponent required for initialisation purposes
 */
export interface QuestionViewComponentShape extends ViewComponentShape {
  /**
   * A QuestionViewComponent requires a form so it is present in this interface as a required variable
   */
  form: FormGroup;

  /**
   * A callback to call whenever a question change event occurs
   */
  questionChangeCallback?: QuestionChangeCallback;

  /**
   * An optional parent if one exists
   */
  parent?: QuestionViewComponent;

  /**
   * This context is passed in by a parent component that supports the autosaving of an application given
   * that all registered question components are filled in. Register the question component with this component
   * if you wish the question to be considered for autosave
   */
  autosaveContext: AutosaveContext;

  /**
   * Determines if the component should hide comments (don't display them). This can be used if parent components wish to
   * manage the comments at a top-level rather than at the child question level
   */
  hideComments?: boolean;
}

/**
 * This interface is the base interface for all components that are designed to render the component
 * that they compose.
 * 
 * The ngOnDestroy should clean up after the component, i.e. removing itself from the form and destroying
 * any child components
 */
export interface ApplicationViewComponent extends OnDestroy {
  /**
   * The display context the view component is being rendered inside
   */
  context: ComponentDisplayContext;

  /**
   * The component being rendered by this view
   */
  component: ApplicationComponent;

  /**
   * The object representing the current application being viewed. Not all components need an application for their
   * context, so it is an optional parameter. However it should be passed to all composite components like sections
   * and containers so that they can pass it to their sub-components
   */
  application?: Application;

  /**
   * Cast the component in this view to the specific application template component the view
   * is intended to render
   */
  castComponent(): any;

  /**
   * This will be called by the host component to request that the component be initialised with the values from the given data. It should only be called before
   * ngOnInit. If not called, the component will not be initialised properly and when ngOnInit is called, the results may be undefined
   * If the view component is a QuestionViewComponent, this data should be in the shape of the sub-interface QuestionViewComponentShape
   * @param data the data (Object in the shape of a view component) to initialise the component with
   */
  initialise(data: ViewComponentShape): void;

  /**
   * Determine if the component is visible or not. If this returns false, it does not necessarily mean that the component is not rendered in the browser,
   * instead it means that setVisible was called with false. By default, when the component is loaded, setVisible will be called with true
   */
  isVisible(): boolean;

  /**
   * Set the value for visible on this component. If the component is hidden for any reason, this should be called with a value of false
   * @param visible the new value for visible
   */
  setVisible(visible: boolean): void;

  /**
   * If the component defines a max width, this function can be implemented. Return -1 if it can't be calculated. Can be useful for a question table
   * to define it's max width within its container so that clients (example signatures) can define their max widths
   */
  maxWidth?(): number;
}

/**
 * This event represents an event emitted by the QuestionViewComponent if the value changes
 */
export class QuestionChangeEvent {
  /**
   * The ID of the question view that triggered the event. This may be the componentID depending on the context
   */
  id: string;
  /**
   * The view that emitted the question change event
   */
  view: QuestionViewComponent;
  /**
   * Determine if an autosave context should trigger an autosave satisfying (determine if autosave should occur) check.
   * If false however, the answer will still be saved to the autosave context unless the component emitting the event
   * implements a disableAutosave method that returns false
   */
  autosave: boolean;

  constructor(id: string, view: QuestionViewComponent, autosave: boolean = true) {
    this.id = id;
    this.view = view;
    this.autosave = autosave;
  }
}

/**
 * This is a specialisation interface that any component representing a question
 * and has a "value" should implement
 */
export interface QuestionViewComponent extends ApplicationViewComponent {
  /**
   * A QuestionViewComponent requires a form so it is present in this interface as a required variable
   */
  form: FormGroup;
  /**
   * The event that is triggered when a value changes
   */
  questionChange: QuestionChange;
  /**
   * A question view component may have a parent component. If a parent exists and parent.display or parent.edit is true,
   * the childs respective methods must return true. Be careful to avoid infinite recursion
   */
  parent: QuestionViewComponent;
  /**
   * This context is passed in by a parent component that supports the autosaving of an application given
   * that all registered question components are filled in. Register the question component with this component
   * if you wish the question to be considered for autosave
   */
  autosaveContext: AutosaveContext;
  /**
   * Determines if the component should hide comments (don't display them). This can be used if parent components wish to
   * manage the comments at a top-level rather than at the child question level.
   * 
   * An optional variable since not all components support comments anyway, regardless of this value
   */
  hideComments?: boolean;
  /**
   * An optional variable which is read by QuestionViewUtils.setExistingAnswer to override its check on QuestionViewUtils.edit. Usually
   * an answer should only be set if the component is to be edited, as the answer would be displayed in answer-view otherwise. If this
   * constraint does not make sense on this component, the component can define this variable with a value of true
   */
  setAnswerOnNoEdit?: boolean;
  /** 
   * An optional variable which is read by QuestionViewUtils.display to override the check on displaying the component if the state is not Draft or
   * referred and no answer exists for the component. The default in this condition is to not display the component. This flag, if true, will display it
   * regardless
   */
  displayNoAnswer?: boolean;
  /**
   * If a question component acts as a parent component for child question components and the children do not have answers,
   * the children can question this method in the parent to display a placeholder should displayAnswer() return false.
   * 
   * For example, in a question table, if no answer is displayed there is just a blank cell
   */
  displayAnswerPlaceholder?: boolean;

  /**
   * This method should be called to add the component (or sub-components if this question has multiple parts) to the form.
   * If it is already a part of the form, it should be a no-op. If edit() returns false, that component should not be added to the form
   * 
   * This should be called from the component's ngOnInit method, i.e. before the view is initialized
   */
  addToForm(): void;

  /**
   * This method should be called to remove the component (and all sub-components if the question has multiple parts) from the form.
   * The controls should not be physically removed as that can cause template issues. However any validation and any answers provided should 
   * be cleared so that the form can be valid without them
   */
  removeFromForm(): void;

  /**
   * This method is used to autofill the component if it supports it. If the question component
   * does not support autofill, there is no need to implement this method or satisy an autofill field passed into the
   * associated component
   * 
   * TODO: For now, autofill is only supported in text and select question views. In the future, it may be expanded to other components
   */
  autofill?(): void;

  /**
   * If the application implements autofill, this method should be called and implemented where the component attaches itself to the notifier
   * and notify of autofill events
   * @param notifier the notifier to attach the component to
   */
  registerAutofill?(notifier: AutofillNotifier): void;

  /**
   * Determine whether the question component should be displayed based on the status of the application
   * and if it is to be edited based on that status and other conditions
   */
  display(): boolean;

  /**
   * Determine if the answer should be displayed
   */
  displayAnswer(): boolean;

  /**
   * Determine whether the question component can be edited or if it is to be just displayed as a question and answer if an answer if available
   */
  edit(): boolean;

  /**
   * Trigger the questionChange to emit. If autosave is true, it tells any autosave notifier to check for autosave satisfaction. If emitChange is false, only
   * the autosave notifier will be notified, not the questionChange
   */
  emit(autosave: boolean, emitChange: boolean): void;

  /**
   * Create an answer that represents the answer given to this question view component and return it as the value. If the component contains multiple question components,
   * the answers can be returned as an array of answers
   */
  value(): Answer | Answer[];

  /**
   * There may be instances where the value of a component may need to be set from an answer for that component. For example,
   * if an application is referred and a field is editable, the field(s) should be set from the previous answers. If the component contains multiple other questions,
   * for example multipart question, it should set each part of the individual answer and react to the value change events (ie. multipart will need to display other
   * components). If it is a component that has multiple questions anyway and it is referred and at least one sub-question is in editable fields, the whole parent
   * component should be made editable automatically and set the answers.
   * 
   * This method should not emit any events, i.e. question changes to parents. When calling setValue on FormControls' ensure you include the option,
   * {emitEvent: false}. The question change should not be emitted since the answer already exists in the application so does not need to notify parent
   * components of its existence. This method should only be called on component initialisation, not to set the value of the component.
   * 
   * @param answer the answer to set the value from
   */
  setFromAnswer(answer: Answer): void;

  /**
   * An optional method to implement and return false if this component should not be counted towards autosave
   */
  disableAutosave?(): boolean;

  /**
   * Disable/enable the question component, so it can/cannot be edited
   * @param disabled true to disable the component, false to enable
   */
  setDisabled(disabled: boolean): void;

  /**
   * Mark the component as required
   */
  markRequired(): void;

  /**
   * This method returns the name of the form control used by this component. Default is to use QuestionComponent.name. If different,
   * define this
   */
  questionName?(): string;

  /**
   * This function returns the validator that validates the component if it is required. Used by QuestionViewUtils.enableValidateOnDisableAnswerRequest.
   * If not defined, Validators.required is used
   */
  requiredValidator?(): ValidatorFn;
}

/**
 * This interface represents a component that is the source of an action branch. It provides callback methods for the target to notify
 * of error/success
 */
export interface ActionBranchSource {
  /**
   * Callback for when the attach-file action triggers and completes. Takes a message to display in the source
   * @param message the message to display
   * @param error true if error, false if not
   */
  onFileAttached(message: string, error?: boolean): void;

  /**
   * Display the provided error message in some way
   * @param msg the message to display
   */
  displayError(msg: string): void;

  /**
   * Perform the attach file action
   */
  attachFile(): void;

  /**
   * Execute the terminate action.
   * @param args the args an implementation can choose to accept. 
   */
  terminate(...args: any[]): void;
}

/**
 * This interface represents the source of an autosave event (usually sections)
 */
export interface AutosaveSource {
  /**
   * Retrieves the ID of the component being autosaved
   */
  getComponentId(): string;

  /**
   * Callback for when autosave succeeds/fails
   * @param message the message to display
   * @param error true if error
   */
  onAutoSave(message: string, error?: boolean): void;
}