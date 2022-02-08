import { Component, Input, OnInit, OnChanges, ViewChildren } from '@angular/core';
import { SectionComponent } from '../../../models/components/sectioncomponent';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { ApplicationViewComponent } from '../application-view.component';
import { ComponentHost, ComponentHostDirective } from '../component-host.directive';
import { ViewComponentRegistration, registeredComponents } from '../registered.components';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-section-view',
  templateUrl: './section-view.component.html',
  styleUrls: ['./section-view.component.css']
})
@ViewComponentRegistration(ComponentType.SECTION)
export class SectionViewComponent implements OnInit, OnChanges, ApplicationViewComponent, ComponentHost {
  /**
   * The component to be displayed
   */
  @Input() component: ApplicationComponent;
  /**
   * The optional form parameter if the child components require it
   */
  @Input() form: FormGroup;
  /**
   * The list of component hosts found in the view
   */
  @ViewChildren(ComponentHostDirective)
  componentHosts: ComponentHostDirective[]
  /**
   * The single component host found
   */
  componentHost!: ComponentHostDirective;
  /**
   * The flag to track if the view is initialised
   */
  private _viewInitialised: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes): void {
    this.loadComponents();
  }

  ngAfterViewInit(): void {
    this._viewInitialised = true;

    for (let host of this.componentHosts) {
      if (host.hostId == this.component.componentId) {
        this.componentHost = host;
      }
    }

    if (this.componentHost == undefined || this.componentHost == null) {
      throw new Error('You need to specify the componentHost [hostId]="component.componentId" on the ng-template');
    }

    this.loadComponents();
  }

  viewInitialised(): boolean {
    return this._viewInitialised;
  }

  loadComponents() {
    if (this.component && this.viewInitialised()) {
      const castedComponent = this.castComponent();
      const viewContainerRef = this.componentHost.viewContainerRef;
      viewContainerRef.clear();
      
      for (let sub of castedComponent.components) {
        const componentRef = viewContainerRef.createComponent<ApplicationViewComponent>(registeredComponents.getComponent(sub.getType()));
        componentRef.instance.component = sub;

        if (sub.isFormElement()) {
          componentRef.instance.form = this.form;
        }

        componentRef.changeDetectorRef.detectChanges();
      }
    }
  }

  castComponent() {
    return this.component as SectionComponent;
  }

  // TODO implement the other component views. Implement the view for viewing an application template also which has an element marked as componentHost and load components like this
  // TODO Also implement application models like the application class and request/response classes. Then have an ApplicationContext class that holds the application being worked on. This context class can be made an attribute of the ApplicationViewComponent interface since to render (and perform actions) on the rendered components (such as save sections, answers etc.) you need the application context which may also hold the application service reference etc.
}
