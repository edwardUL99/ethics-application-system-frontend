import { AfterViewInit, Input } from '@angular/core';
import { Directive, ViewContainerRef } from '@angular/core';
import { TrackedEventEmitter } from '../../../utils';
import { ComponentType } from '../../models/components/applicationcomponent';
import { QuestionChange, QuestionChangeEvent, QuestionViewComponent } from './application-view.component';
import { DynamicComponentLoader } from './dynamiccomponents';

/**
 * This class marks a directive that marks an element as a placeholder/container to load ApplicationViewComponents into dynamically.
 * It should be used on ng-templates like so:
 * <code>
 *  <ng-template componentHost [hostId]="component.componentId"></ng-template>
 * </code>
 * where component is the component that contains sub-components
 */
@Directive({
  selector: '[componentHost]'
})
export class ComponentHostDirective implements AfterViewInit {
  /**
   * The ID of the component host. Should be the ID of the component being rendered by the view that is the parent of the directive
   */
  @Input() hostId: string = '';

  constructor(public viewContainerRef: ViewContainerRef, private loader: DynamicComponentLoader) { }

  /**
   * When the directive is fully loaded it registers itself with the component loader so that child components can be loaded into it
   */
  ngAfterViewInit(): void {
    this.loader.registerComponentHost(this);
  }
}

/**
 * This interface marks a component as a component host and that it needs to load the components.
 * Can be a recursive definition, sub-components can also be component hosts, e.g. containers and sections.
 * Extends the AfterViewInit interface since the loadComponents call should be made from that callback function
 */
export interface ComponentHost extends AfterViewInit {
  /**
   * Determines if the view is initialised or not
   */
  viewInitialised(): boolean;

  /**
   * The method the component should call to load and create the components that it hosts.
   * <b>Important: </b>After calling initialise on any component, ensure to call changeDetectorRef.detectChanges() on the created component reference to ensure 
   * the component gets created
   */
  loadComponents(): void;

  /**
   * This method should detect the changes of the host component after loading the sub components.
   * 
   * This should be called at the end of every loadComponents() call
   */
  detectChanges(): void;

  /**
   * Propagate up all the question change events from the sub components in the component host. Pass in the host
   * component's instance of QuestionChange at callback construction time to capture it:
   * <code>
   * const callback = (e: QuestionChangeEvent) => this.propagateQuestionChange(this.questionChange, e);
   * component.initialise(*params*, callback)
   * </code>
   * @param questionChange the question change instance
   * @param e the event being propagated
   */
  propagateQuestionChange(questionChange: QuestionChange, e: QuestionChangeEvent): void;
}

/** 
 * A type for mapping of some form of ID to their matched component references
 */
export type MatchedQuestionComponents = {
  [key: string]: QuestionViewComponent
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
  /**
   * Get the hosted child questions in a list
   */
  getHostedQuestions(): QuestionViewComponent[];
}
