import { OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TrackedEventEmitter } from '../../../utils';
import { Answer } from '../../models/applications/answer';
import { Application } from '../../models/applications/application';
import { ApplicationComponent } from '../../models/components/applicationcomponent';
import { ApplicationTemplateDisplayComponent } from '../application-template-display/application-template-display.component';

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
  application?: Application;
  /**
   * The display component the view component is being rendered inside. An optional parameter, as a
   * component does not have to consume it. However, sections and containers should take it and pass it
   * to its children
   */
  template?: ApplicationTemplateDisplayComponent;
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
   * The display component the view component is being rendered inside
   */
  template?: ApplicationTemplateDisplayComponent;

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
   * Determine if this event should be checked for autosave
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
   * Trigger the questionChange to emit
   */
  emit(autosave: boolean): void;

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
   * If the parent of the question component is not null, this method should not emit the event. The responsibility for emitting the event is up to the parent components when
   * everything is initialised correctly
   * 
   * @param answer the answer to set the value from
   */
  setFromAnswer(answer: Answer): void;

  /**
   * An optional method to implement and return false if this component should not be counted towards autosave
   */
  disableAutosave?(): boolean;
}

/**
 * This interface represents a specialisation of the application view component for sections to allow for autosave functionality.
 */
export interface SectionViewComponent extends ApplicationViewComponent {
  /**
   * Get the list of child question view components (should recursively retrieve them from sub sections and containers too)
   */
  getChildQuestionComponents(): QuestionViewComponent[];
}