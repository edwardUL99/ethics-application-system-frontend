import { ApplicationComponent } from '../../models/components/applicationcomponent';
import { ComponentHostDirective } from './component-host.directive'
import { ApplicationViewComponent, QuestionChangeCallback, QuestionViewComponent, ViewComponentShape } from './application-view.component';
import { FormGroup } from '@angular/forms';
import { ComponentRef } from '@angular/core';
import { SectionViewComponentShape } from './section-view/section-view.component';
import { DynamicComponentLoader } from './dynamiccomponents';
import { Application } from '../../models/applications/application';

/**
 * This class represents the base class that all component hosts should extend from
 */
export class AbstractComponentHost {
  /**
   * Load the individual sub-component
   * @param loader the loader to load the components with
   * @param componentHost the component host to load the components into
   * @param data the data to initialise the component with
   */
  protected loadComponent(loader: DynamicComponentLoader, componentHost: string, data: ViewComponentShape) {
    const componentRef = loader.loadComponent(componentHost, data.component.getType());

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