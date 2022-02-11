import { ApplicationComponent } from '../../models/components/applicationcomponent';
import { ComponentHostDirective } from './component-host.directive'
import { ApplicationViewComponent, QuestionChangeCallback } from './application-view.component';
import { registeredComponents } from './registered.components';
import { FormGroup } from '@angular/forms';
import { ComponentRef } from '@angular/core';

/**
 * This class represents the base class that all component hosts should extend from
 */
export class AbstractComponentHost {
    /**
     * Load the individual component. If multiple components need to be loaded, this can be called iteratively
     * @param componentHost the host directive to load the component into
     * @param component the component to load
     * @param form the form to pass in if it is required
     * @param questionChangeCallback An optional callback function to respond to QuestionChangeEvents that may be emitted by the loaded component
     */
    protected loadComponent(componentHost: ComponentHostDirective, component: ApplicationComponent, form: FormGroup, questionChangeCallback?: QuestionChangeCallback): ComponentRef<ApplicationViewComponent>  {
        const componentRef = componentHost.viewContainerRef.createComponent<ApplicationViewComponent>(registeredComponents.getComponent(component.getType()));
        const data = (component.isFormElement() || component.isComposite) ? {component: component, form: form, questionChangeCallback: questionChangeCallback}
          : {component: component};

        componentRef.instance.initialise(data);
        componentRef.changeDetectorRef.detectChanges();

        return componentRef;
    }
}