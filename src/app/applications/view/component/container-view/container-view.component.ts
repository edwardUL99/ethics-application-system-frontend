import { Component, Input, OnInit, OnChanges, ViewChild, ViewChildren } from '@angular/core';
import { ContainerComponent } from '../../../models/components/containercomponent';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { ApplicationViewComponent } from '../application-view.component';
import { ComponentHost, ComponentHostDirective } from '../component-host.directive';
import { ViewComponentRegistration, registeredComponents } from '../registered.components';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-container-view',
  templateUrl: './container-view.component.html',
  styleUrls: ['./container-view.component.css']
})
@ViewComponentRegistration(ComponentType.CONTAINER)
export class ContainerViewComponent implements OnInit, OnChanges, ApplicationViewComponent, ComponentHost {
  /**
   * The component to be displayed
   */
  @Input() component: ApplicationComponent;
  /**
   * A form to add any sub-components to if they require it
   */
  @Input() form: FormGroup;
  /**
   * All the component hosts found in the view
   */
  @ViewChildren(ComponentHostDirective)
  componentHosts: ComponentHostDirective[];
  /**
   * The directive for storing sub-components
   */
  // @ViewChild(ComponentHostDirective, {static: true})
  @ViewChild(ComponentHostDirective)
  componentHost!: ComponentHostDirective
  /**
   * The flag to track if the view is initialised
   */
   private _viewInitialised: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
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
    return this.component as ContainerComponent;
  }
}
