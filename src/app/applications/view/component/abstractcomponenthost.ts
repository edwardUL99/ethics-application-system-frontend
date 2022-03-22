import { ViewComponentShape } from './application-view.component';
import { SectionViewComponentShape } from './section-view/section-view.component';
import { DynamicComponentLoader } from './dynamiccomponents';

/**
 * This class represents the base class that all component hosts should extend from
 */
export class AbstractComponentHost {
  /**
   * Load the individual sub-component
   * @param loader the loader to load the components with
   * @param componentHost the component host to load the components into
   * @param data the data to initialise the component with
   * @param delayChangeDetect pass this value to delay change detection. If true, the change detection must be called manually
   */
  protected loadComponent(loader: DynamicComponentLoader, componentHost: string, data: ViewComponentShape, delayChangeDetect?: boolean) {
    const componentRef = loader.loadComponent(componentHost, data.component.getType());

    componentRef.instance.initialise(data);
    componentRef.instance.setVisible(true);

    if (!delayChangeDetect) {
      componentRef.changeDetectorRef.detectChanges();
    }

    return componentRef;
  }

  /**
   * If the sub component being loaded is a sub section, use this method to load it instead of loadComponent
   * @param loader the loader injected into the subclass
   * @param componentHost the ID of the host directive to load the component into
   * @param data the data representing the component initialisation information
   * @param delayChangeDetect pass this value to delay change detection. If true, the change detection must be called manually
   */
  protected loadComponentSubSection(loader: DynamicComponentLoader, componentHost: string, data: SectionViewComponentShape, delayChangeDetect?: boolean) {
    const componentRef = loader.loadComponent(componentHost, data.component.getType());
    
    componentRef.instance.initialise(data);
    componentRef.instance.setVisible(true);

    if (!delayChangeDetect) {
      componentRef.changeDetectorRef.detectChanges();
    }

    return componentRef;
  }
}