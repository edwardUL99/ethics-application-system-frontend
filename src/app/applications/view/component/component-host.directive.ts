import { AfterViewInit, Input } from '@angular/core';
import { Directive, ViewContainerRef } from '@angular/core';

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
  componentHost: ComponentHostDirective;

  /**
   * Determines if the view is initialised or not
   */
  viewInitialised(): boolean;

  /**
   * The method the component should call to load and create the components that it hosts
   */
  loadComponents(): void;
}
