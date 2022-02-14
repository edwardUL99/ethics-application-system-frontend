import { EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ApplicationComponent } from '../../models/components/applicationcomponent';
import { ValueType } from './valuetype';

/**
 * This type represents a callback for when a question change event is fired
 */
export type QuestionChangeCallback = Function;

/**
 * This is a specialised EventEmitter class for registering QuestionChangeCallbacks
 */
export class QuestionChange extends EventEmitter<QuestionChangeEvent> {
  constructor() {
    super();
  }

  /**
   * Registers the callback by subscribing to the emitter with the emitted event being passed into the callback
   * @param callback the callback to register
   */
  register(callback: QuestionChangeCallback) {
    this.subscribe(callback);
  }
}

/**
 * This interface is essentially the ApplicationViewComponent interface but just with the properties required for initialisation
 */
export interface ViewComponentShape {
  /**
   * The component being rendered by this view
   */
  component: ApplicationComponent;
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
}

/**
 * This interface is the base interface for all components that are designed to render the component
 * that they compose
 */
export interface ApplicationViewComponent {
  /**
   * The component being rendered by this view
   */
  component: ApplicationComponent;

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
   * Set the value of the component with the given component ID. If the component is a QuestionView component, this 
   * may involve setting the value of the question it contains or the sub-question. If the question is being changed as a result
   * of setValue, questionChange events should not be propagated.
   * 
   * If the component is not a question view component, but it does hold sub-components (composite), it should propagate the 
   * call down all of its components until it returns true. If it is not composite and not a question, it can be a no-op (returns false)
   * 
   * @param componentId the component ID
   * @param value the value to set
   * @return true if the matching component has been found and value set
   */
  setValue(componentId: string, value: ValueType): boolean;
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
   * The value returned in the event
   */
  value: ValueType;

  constructor(id: string, value: ValueType) {
    this.id = id;
    this.value = value;
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
   * Retrieve the value entered into the component. The shape of the value is determined by
   * the specific component
   * @returns the value of the component
   */
  value(): ValueType;

  /**
   * This method should be called to remove the component (and all sub-components if the question has multiple parts) from the form
   */
  removeFromForm(): void;

  /**
   * This method should be called to add the component (or sub-components if this question has multiple parts) to the form.
   * If it is already a part of the form, it should be a no-op.
   * 
   * This should be called from the component's ngOnInit method, i.e. before the view is initialized
   */
  addToForm(): void;
}