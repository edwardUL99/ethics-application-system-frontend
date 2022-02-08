import { OnChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ApplicationComponent } from '../../models/components/applicationcomponent';

/**
 * This interface is the base interface for all components that are designed to render the component
 * that they compose
 */
export interface ApplicationViewComponent extends OnChanges {
    /**
     * The component being rendered by this view
     */
    component: ApplicationComponent;
    /**
     * If the component is working with a form this element can be set
     */
    form?: FormGroup;

    /**
     * Cast the component in this view to the specific application template component the view
     * is intended to render
     */
    castComponent(): any;
}