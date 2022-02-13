import { ApplicationComponent } from '../../models/components/applicationcomponent';
import { ComponentHostDirective } from './component-host.directive'
import { ApplicationViewComponent, QuestionChangeCallback } from './application-view.component';
import { FormGroup } from '@angular/forms';
import { ComponentRef } from '@angular/core';
import { SectionViewComponentShape } from './section-view/section-view.component';
import { DynamicComponentLoader } from './dynamiccomponents';

/**
 * This class represents the base class that all component hosts should extend from
 */
export class AbstractComponentHost {
  /**
   * Load the individual sub-component. If multiple components need to be loaded, this can be called iteratively
   * @param loader the loader injected into the subclass
   * @param componentHost the ID of the host directive to load the component into
   * @param component the component to load
   * @param form the form to pass in if it is required
   * @param questionChangeCallback An optional callback function to respond to QuestionChangeEvents that may be emitted by the loaded component
   */
  protected loadComponent(loader: DynamicComponentLoader, componentHost: string, component: ApplicationComponent, form: FormGroup, questionChangeCallback?: QuestionChangeCallback): ComponentRef<ApplicationViewComponent>  {
    const componentRef = loader.loadComponent(componentHost, component.getType());
    const data = (component.isFormElement() || component.isComposite) ? {component: component, form: form, questionChangeCallback: questionChangeCallback}
      : {component: component};

    componentRef.instance.initialise(data);
    componentRef.changeDetectorRef.detectChanges();

    return componentRef;
  }

  /**
   * If the sub component being loaded is a sub section, use this method to load it instead of loadComponent
   * @param loader the loader injected into the subclass
   * @param componentHost the ID of the host directive to load the component into
   * @param data the data representing the component initialisation information
   */
  protected loadComponentSubSection(loader: DynamicComponentLoader, componentHost: string, data: SectionViewComponentShape) {
    const componentRef = loader.loadComponent(componentHost, data.component.getType());

    componentRef.instance.initialise(data);
    componentRef.changeDetectorRef.detectChanges();

    return componentRef;
  }
}