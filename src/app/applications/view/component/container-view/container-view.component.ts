import { Component, Input, OnInit, OnChanges, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ContainerComponent } from '../../../models/components/containercomponent';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { ApplicationViewComponent, QuestionViewComponentShape, ViewComponentShape } from '../application-view.component';
import { ComponentHost } from '../component-host.directive';
import { ViewComponentRegistration } from '../registered.components';
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
    this.loader.destroyComponents(this.component.componentId);
  }

  ngAfterViewInit(): void {
    this._viewInitialised = true;
    this.loadComponents();
  }

  viewInitialised(): boolean {
    return this._viewInitialised;
  }

  loadComponents() {
    if (this.component && this.viewInitialised()) {
      const castedComponent = this.castComponent();
      castedComponent.components.forEach(component => this.loadComponent(this.loader, this.component.componentId, component, this.form));
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
