import { Component, Input, OnInit, OnChanges, ViewChild, ViewChildren, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ContainerComponent } from '../../../models/components/containercomponent';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { ApplicationViewComponent, QuestionViewComponent, QuestionViewComponentShape, ViewComponentShape } from '../application-view.component';
import { ComponentHost, ComponentHostDirective } from '../component-host.directive';
import { ViewComponentRegistration, registeredComponents } from '../registered.components';
import { FormGroup } from '@angular/forms';
import { AbstractComponentHost } from '../abstractcomponenthost';
import { DynamicComponentLoader } from '../dynamiccomponents';

@Component({
  selector: 'app-container-view',
  templateUrl: './container-view.component.html',
  styleUrls: ['./container-view.component.css']
})
@ViewComponentRegistration(ComponentType.CONTAINER)
export class ContainerViewComponent extends AbstractComponentHost implements OnInit, OnChanges, ApplicationViewComponent, ComponentHost, OnDestroy {
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

  constructor(private readonly cd: ChangeDetectorRef,
    private loader: DynamicComponentLoader) { 
    super();
  }

  initialise(data: ViewComponentShape): void {
    const questionData = data as QuestionViewComponentShape;
    this.component = questionData.component;
    this.form = questionData.form;
  }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    this.loadComponents();
  }

  ngOnDestroy(): void {
    this.loader.destroyComponents(this.componentHost.hostId);
  }

  ngAfterViewInit(): void {
    this._viewInitialised = true;

    for (let host of this.componentHosts) {
      if (host.hostId == this.component.componentId) {
        this.componentHost = host;
        break;
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

      castedComponent.components.forEach(component => this.loadComponent(this.loader, this.componentHost, component, this.form));
    }

    this.detectChanges();
  }

  castComponent() {
    return this.component as ContainerComponent;
  }

  detectChanges(): void {
    this.cd.detectChanges();
  }
}
