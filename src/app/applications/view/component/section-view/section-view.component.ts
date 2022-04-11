import { Component, Input, OnInit, OnChanges, ChangeDetectorRef, OnDestroy, Output, ViewChild, ComponentRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SectionComponent } from '../../../models/components/sectioncomponent';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { QuestionChange, QuestionChangeEvent, QuestionViewComponentShape, ViewComponentShape, QuestionViewComponent, ApplicationViewComponent, AutosaveSource } from '../application-view.component';
import { ComponentHost } from '../component-host.directive';
import { ComponentViewRegistration } from '../registered.components';
import { AbstractComponentHost } from '../abstractcomponenthost';
import { DynamicComponentLoader } from '../dynamiccomponents';
import { Application } from '../../../models/applications/application';
import { AlertComponent } from '../../../../alert/alert.component';
import { AutosaveContext } from '../autosave';
import { ComponentDisplayContext } from '../displaycontext';

export interface SectionViewComponentShape extends QuestionViewComponentShape {
  /**
   * Determines if the section is a sub-section of another section. If so it is not displayed in another card
   */
  subSection?: boolean;
}

@Component({
  selector: 'app-section-view',
  templateUrl: './section-view.component.html',
  styleUrls: ['./section-view.component.css']
})
@ComponentViewRegistration(ComponentType.SECTION)
export class SectionViewComponent extends AbstractComponentHost implements OnInit, OnChanges, ApplicationViewComponent, ComponentHost, OnDestroy, AutosaveSource {
  /**
   * The display context the view component is being rendered inside
   */
  @Input() context: ComponentDisplayContext;
  /**
   * The component to be displayed
   */
  @Input() component: ApplicationComponent;
  /**
   * The optional form parameter if the child components require it
   */
  @Input() form: FormGroup;
  /**
   * The current application object
   */
  @Input() application: Application;
  /**
   * The question change to propagate changes
   */
  @Output() questionChange: QuestionChange = new QuestionChange();
  /**
   * Determines if the section is a sub-section of another section. If so it is not displayed in another card
   */
  subSection: boolean = false;
  /**
   * The css class for the section
   */
  sectionClass: string;
  /**
   * The alert to display that the component was autosaved
   */
  @ViewChild('autoSaveAlert')
  autoSaveAlert: AlertComponent
  /**
   * The flag to track if the view is initialised
   */
  private _viewInitialised: boolean = false;
  /**
   * The autosave context to pass into questions
   */
  private autosaveContext: AutosaveContext;
  /**
   * Determines if the component is visible
   */
  @Input() visible: boolean;

  constructor(private readonly cd: ChangeDetectorRef,
    private loader: DynamicComponentLoader) {
    super();
  }

  initialise(data: ViewComponentShape): void {
    const questionData = data as SectionViewComponentShape;
    this.context = data.context;

    this.component = questionData.component;
    this.application = data.application;
    this.form = questionData.form;
    this.subSection = questionData.subSection;
    this.sectionClass = (!this.subSection) ? 'card shadow my-3 p-3':'my-3 p-3';
    
    if (this.subSection) {
      this.autosaveContext = questionData.autosaveContext;
    } else {
      this.autosaveContext = new AutosaveContext();
      this.autosaveContext?.onAutoSave.subscribe(autosave => {
        if (autosave) {
          this.context.autosave(this);
        }
      });
    }
  
    if (questionData.questionChangeCallback) {
      this.questionChange.register(questionData.questionChangeCallback);
    }
  }

  getComponentId(): string {
    return this.component?.componentId;
  }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    this.loadComponents();
  }

  ngOnDestroy(): void {
    this.questionChange.destroy();
    this.loader.destroyComponents(this.component.componentId);

    if (!this.subSection) {
      // owner of the autosave context, so tear it down
      this.autosaveContext?.tearDown();
    }
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
      const callback = (e: QuestionChangeEvent) => {
        this.propagateQuestionChange(this.questionChange, e);
      };

      const castedComponent = this.castComponent();
      const detectChangesList: ComponentRef<ApplicationViewComponent>[] = [];
      
      castedComponent.components.forEach(component => {
        let ref: ComponentRef<ApplicationViewComponent>;

        if (component.getType() == ComponentType.SECTION) {
          ref = this.loadComponentSubSection(this.loader, this.component.componentId,
            {component: component, application: this.application, form: this.form, subSection: true, questionChangeCallback: callback, autosaveContext: this.autosaveContext, context: this.context}, true); // section is being loaded inside in a section, so, it is a sub-section
            detectChangesList.push(ref);
        } else {
          const data: QuestionViewComponentShape = {
            application: this.application,
            component: component,
            form: this.form,
            questionChangeCallback: callback,
            context: this.context,
            autosaveContext: this.autosaveContext
          };

          ref = this.loadComponent(this.loader, this.component.componentId, this.context.autofillNotifier, data, true);
          detectChangesList.push(ref);
        }

        if (component.isComposite) {
          // register a composite component so that it can be deleted after all its children if a container is replace in the template display
          this.loader.registerReference(component.componentId, ref);
        }
      });

      detectChangesList.forEach(ref => ref.changeDetectorRef.detectChanges());
    }

    this.detectChanges();
  }

  castComponent() {
    return this.component as SectionComponent;
  }

  detectChanges(): void {
    this.cd.detectChanges();
  }

  propagateQuestionChange(questionChange: QuestionChange, e: QuestionChangeEvent) {
    questionChange.emit(e);
  }

  onAutoSave(message: string, error: boolean = false) {
    if (this.autoSaveAlert) {
      this.autoSaveAlert.displayMessage(message, error);
    }
  }

  isVisible(): boolean {
    return this.visible;
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
  }
}
