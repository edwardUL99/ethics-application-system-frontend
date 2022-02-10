import { AfterViewInit, Input } from '@angular/core';
import { Directive, ViewContainerRef } from '@angular/core';
import { ComponentType } from '../../models/components/applicationcomponent';

@Directive({
  selector: '[componentHost]'
})
export class ComponentHostDirective {
  /**
   * The ID if the component host
   */
   @Input() hostId: string = '';

  constructor(public viewContainerRef: ViewContainerRef) { }

}

/**
 * This interface marks a component as a component host and that it needs to load the components.
 * Can be a recursive definition, sub-components can also be component hosts, e.g. containers and sections.
 * Extends the AfterViewInit interface since the loadComponents call should be made from that callback function
 */
export interface ComponentHost extends AfterViewInit {
  /**
   * The directive that marked the element as a ComponentHost
   */
  componentHost?: ComponentHostDirective;

  /**
   * Determines if the view is initialised or not
   */
  viewInitialised(): boolean;

  /**
   * The method the component should call to load and create the components that it hosts.
   * <b>Important: </b>After calling initialise on any component, ensure to call changeDetectorRef.detectChanges() on the created component reference to ensure 
   * the component gets created correctly
   */
  loadComponents(): void;

  /**
   * This method should detect the changes of the host component after loading the sub components.
   * 
   * This should be called at the end of every loadComponents() call
   */
  detectChanges(): void;
}

/**
 * This interface represents a component host that specifically holds sub-question components. It has a means of 
 * identifying valid question components that can be hosted
 */
export interface QuestionComponentHost extends ComponentHost {
  /**
   * Return true if the component type is supported by the component host
   * @param componentType the type to validate
   */
  validComponent(componentType: ComponentType): boolean;
}
