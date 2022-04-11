import { Component, Input, OnInit, OnChanges, ChangeDetectorRef, OnDestroy, Output, ComponentRef } from '@angular/core';
import { ContainerComponent } from '../../../models/components/containercomponent';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { ApplicationViewComponent, QuestionChange, QuestionChangeEvent, QuestionViewComponentShape, ViewComponentShape } from '../application-view.component';
import { ComponentHost } from '../component-host.directive';
import { ComponentViewRegistration } from '../registered.components';
import { FormGroup } from '@angular/forms';
import { AbstractComponentHost } from '../abstractcomponenthost';
import { DynamicComponentLoader } from '../dynamiccomponents';
import { Application } from '../../../models/applications/application';
import { ApplicationTemplateDisplayComponent } from '../../application-template-display/application-template-display.component';
import { ComponentDisplayContext } from '../displaycontext';

@Component({
  selector: 'app-container-view',
  templateUrl: './container-view.component.html',
  styleUrls: ['./container-view.component.css']
})
@ComponentViewRegistration(ComponentType.CONTAINER)
export class ContainerViewComponent extends AbstractComponentHost implements OnInit, OnChanges, ApplicationViewComponent, ComponentHost, OnDestroy {
  /**
   * The display context the view component is being rendered inside
   */
  @Input() context: ComponentDisplayContext;
  /**
   * The component to be displayed
   */
  @Input() component: ApplicationComponent;
  /**
   * The current application object
   */
  @Input() application: Application;
  /**
   * A form to add any sub-components to if they require it
   */
  @Input() form: FormGroup;
  /**
   * A question change component to propagate changes
   */
  @Output() questionChange: QuestionChange = new QuestionChange();
  /**
   * The flag to track if the view is initialised
   */
  private _viewInitialised: boolean = false;
  /**
   * Determines if the component is visible
   */
  @Input() visible: boolean;

  constructor(private readonly cd: ChangeDetectorRef,
    private loader: DynamicComponentLoader) { 
    super();
  }

  initialise(data: ViewComponentShape): void {
    const questionData = data as QuestionViewComponentShape;
    this.context = data.context;
    this.component = questionData.component;
    this.application = data.application;
    this.form = questionData.form;

    if (questionData.questionChangeCallback) {
      this.questionChange.register(questionData.questionChangeCallback);
    }
  }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    this.loadComponents();
  }

  ngOnDestroy(): void {
    this.questionChange.destroy();
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
      const callback = (e: QuestionChangeEvent) => this.propagateQuestionChange(this.questionChange, e);
      const castedComponent = this.castComponent();
      castedComponent.components.forEach(component => {
        let ref: ComponentRef<ApplicationViewComponent>;
        
        const data: QuestionViewComponentShape = {
          application: this.application,
          component: component,
          form: this.form,
          questionChangeCallback: callback,
          context: this.context,
          autosaveContext: undefined
        };

        ref = this.loadComponent(this.loader, this.component.componentId, this.context.autofillNotifier, data);

        if (component.isComposite) {
          // register a composite component so that it can be deleted after all its children if a container is replace in the template display
          this.loader.registerReference(component.componentId, ref);
        }
      });
    }

    this.detectChanges();
  }

  propagateQuestionChange(questionChange: QuestionChange, e: QuestionChangeEvent) {
    questionChange.emit(e);
  }

  castComponent() {
    return this.component as ContainerComponent;
  }

  detectChanges(): void {
    this.cd.detectChanges();
  }

  isVisible(): boolean {
    return this.visible;
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
  }
}
