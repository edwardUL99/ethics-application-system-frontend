import { ApplicationViewComponent, QuestionViewComponent, ViewComponentShape } from './application-view.component';
import { SectionViewComponentShape } from './section-view/section-view.component';
import { DynamicComponentLoader } from './dynamiccomponents';
import { AutofillNotifier } from '../../autofill/autofillnotifier';
import { ComponentRef } from '@angular/core';
import { QuestionComponent } from '../../models/components/questioncomponent';

/**
 * This class represents the base class that all component hosts should extend from
 */
export class AbstractComponentHost {
  /**
   * Register the autofill if the component implements it
   * @param autofillNotifier the notifier to register with
   * @param component the component to attach
   */
  private _registerAutofill(autofillNotifier: AutofillNotifier, component: ApplicationViewComponent) {
    if (typeof((component as any).autofill) === 'function') {
      const questionComponent = component as QuestionViewComponent;

      if (questionComponent.castComponent().autofill) {
        if (typeof(questionComponent.registerAutofill) === 'function') {
          questionComponent.registerAutofill(autofillNotifier);
        } else {
          throw new Error('The component supports autofill but does not implement registerAutofill');
        }
      }
    }
  }

  /**
   * Initialise the component instance
   * @param componentRef the reference of the component to initialise
   * @param data the data to initialise the component with
   */
  private initialiseInstance(componentRef: ComponentRef<ApplicationViewComponent>, data: ViewComponentShape) {
    componentRef.instance.initialise(data);
    componentRef.instance.setVisible(true);
  }

  /**
   * Load the individual sub-component
   * @param loader the loader to load the components with
   * @param componentHost the component host to load the components into
   * @param autofillNotifier the notifier to notify if autofill events occurred and the component supports it
   * @param data the data to initialise the component with
   * @param delayChangeDetect pass this value to delay change detection. If true, the change detection must be called manually
   */
  protected loadComponent(loader: DynamicComponentLoader, componentHost: string, autofillNotifier: AutofillNotifier, data: ViewComponentShape, delayChangeDetect?: boolean) {
    const componentRef = loader.loadComponent(componentHost, data.component.getType());

    this.initialiseInstance(componentRef, data);
    this._registerAutofill(autofillNotifier, componentRef.instance);

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
    this.initialiseInstance(componentRef, data);

    if (!delayChangeDetect) {
      componentRef.changeDetectorRef.detectChanges();
    }

    return componentRef;
  }
}