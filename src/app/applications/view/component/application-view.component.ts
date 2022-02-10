import { EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ApplicationComponent } from '../../models/components/applicationcomponent';
import { ValueType } from './valuetype';

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
     * ngOnInit
     * If the view component is a QuestionViewComponent, this data should be in the shape of the sub-interface QuestionViewComponentShape
     * @param data the data (Object in the shape of a view component) to initialise the component with
     */
    initialise(data: ViewComponentShape): void;
}

/**
 * This event represents an event emitted by the QuestionViewComponent is the value changes
 */
export class QuestionViewEvent {
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
    questionChange: EventEmitter<QuestionViewEvent>;

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