import { Component, Input, OnInit, OnChanges, ChangeDetectorRef, OnDestroy, Output, ViewChild, ComponentRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SectionComponent } from '../../../models/components/sectioncomponent';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { SectionViewComponent as ISectionViewComponent, QuestionChange, QuestionChangeEvent, QuestionViewComponentShape, ViewComponentShape, QuestionViewComponent, ApplicationViewComponent } from '../application-view.component';
import { ComponentHost, QuestionComponentHost } from '../component-host.directive';
import { ComponentViewRegistration } from '../registered.components';
import { AbstractComponentHost } from '../abstractcomponenthost';
import { DynamicComponentLoader } from '../dynamiccomponents';
import { Application } from '../../../models/applications/application';
import { ApplicationTemplateDisplayComponent } from '../../application-template-display/application-template-display.component';
import { AlertComponent } from '../../../../alert/alert.component';
import { Answer } from '../../../models/applications/answer';
import { QuestionComponent } from '../../../models/components/questioncomponent';
import { ApplicationStatus } from '../../../models/applications/applicationstatus';

export interface SectionViewComponentShape extends QuestionViewComponentShape {
  /**
   * Determines if the section is a sub-section of another section. If so it is not displayed in another card
   */
  subSection?: boolean;
}

/**
 * A mapping of the questions that have been answered
 */
type QuestionAnswered = {
  [key: string]: boolean
}

@Component({
  selector: 'app-section-view',
  templateUrl: './section-view.component.html',
  styleUrls: ['./section-view.component.css']
})
@ComponentViewRegistration(ComponentType.SECTION)
export class SectionViewComponent extends AbstractComponentHost implements OnInit, OnChanges, ISectionViewComponent, ComponentHost, OnDestroy {
  /**
   * The parent template component
   */
  @Input() template: ApplicationTemplateDisplayComponent;
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
   * The list of child questions stored in the section
   */
  private childQuestions: QuestionViewComponent[];
  /**
   * A map of questions answered to determine when autosave should be triggered
   */
  private answeredQuestions: QuestionAnswered = {};
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
    this.template = data.template;
    this.component = questionData.component;
    this.application = data.application;
    this.form = questionData.form;
    this.subSection = questionData.subSection;
    this.sectionClass = (!this.subSection) ? 'card shadow my-3 p-3':'my-3 p-3';
  
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

  private checkAllRequiredAnswered() {
    let answered: boolean = true;
    
    for (let child of this.childQuestions) {
      const childAnswered = this.answeredQuestions[child.component.componentId];

      if (child.isVisible()) {
        if ((child.component as QuestionComponent).required) {
          answered = childAnswered;

          if (!answered) {
            return false;
          }
        } else {
          answered = answered && childAnswered;
        }
      } else {
        // if not visible, we don't need to wait for an answer
        answered = true;
      }
    }

    if (answered) {
      this.template.autoSaveSection(this);
    }
  }

  private checkQuestionForAutoSave(event: QuestionChangeEvent) {
    const answer: Answer | Answer[] = event.view.value();

    if (answer) {
      if (Array.isArray(answer)) {
        answer.forEach(a => {
          this.answeredQuestions[a.componentId] = !a.empty();
        });
      } else {
        this.answeredQuestions[answer.componentId] = !answer.empty();
      }
    }

    this.checkAllRequiredAnswered();
  }

  private registerQuestionsForAutosave() {
    if (!this.subSection && this.application.status == ApplicationStatus.DRAFT) { // TODO only autosave for draft 
      this.childQuestions = this.getChildQuestionComponents().filter(c => {
        if (typeof c.disableAutosave === 'function') {
          return !c.disableAutosave();
        } else {
          return true;
        }
      });

      this.childQuestions.filter(c => !c.castComponent().editable)
        .forEach(component => this.answeredQuestions[component.component.componentId] = true);

      for (let child of this.childQuestions) {
        const callback = (e: QuestionChangeEvent) => this.checkQuestionForAutoSave(e);
        child.questionChange.register(callback);

        if (child.castComponent().editable) {
          this.checkQuestionForAutoSave(new QuestionChangeEvent(child.component.componentId, child)); // need to check for autofilled values also
        }
      }
    }
  }

  loadComponents() {
    if (this.component && this.viewInitialised()) {
      const callback = (e: QuestionChangeEvent) => this.propagateQuestionChange(this.questionChange, e);
      const castedComponent = this.castComponent();
      
      castedComponent.components.forEach(component => {
        let ref: ComponentRef<ApplicationViewComponent>;

        if (component.getType() == ComponentType.SECTION) {
          ref = this.loadComponentSubSection(this.loader, this.component.componentId,
            {component: component, application: this.application, form: this.form, subSection: true, questionChangeCallback: callback}); // section is being loaded inside in a section, so, it is a sub-section
        } else {
          const data: QuestionViewComponentShape = {
            application: this.application,
            component: component,
            form: this.form,
            questionChangeCallback: callback,
            template: this.template
          };

          ref = this.loadComponent(this.loader, this.component.componentId, data);
        }

        if (component.isComposite) {
          // register a composite component so that it can be deleted after all its children if a container is replace in the template display
          this.loader.registerReference(component.componentId, ref);
        }
      });
    }

    this.detectChanges();
    this.registerQuestionsForAutosave();
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

  private loadContainerQuestions(component: ApplicationViewComponent, components: QuestionViewComponent[]) {
    for (let child of this.loader.getLoadedComponents(component.component.componentId)) {
      const type = child.component.getType();

      if (child.component.isFormElement()) {
        components.push(child as QuestionViewComponent);
      } else if (type == ComponentType.SECTION) {
        const childSection = child as ISectionViewComponent;

        childSection.getChildQuestionComponents().forEach(component => components.push(component));
      } else if (type == ComponentType.CONTAINER) {
        this.loadContainerQuestions(child, components);
      }
    }
  }

  getChildQuestionComponents(): QuestionViewComponent[] {
    const components = [];
    
    for (let child of this.loader.getLoadedComponents(this.component.componentId)) {
      const type = child.component.getType();

      if (type == ComponentType.SECTION) {
        const childSection = child as ISectionViewComponent;

        childSection.getChildQuestionComponents().forEach(component => components.push(component));
      } else if (type == ComponentType.CONTAINER) {
        this.loadContainerQuestions(child, components);
      } else {
        const childQuestionHost = child as unknown as QuestionComponentHost;

        if (typeof(childQuestionHost.getHostedQuestions) === 'function') {
          childQuestionHost.getHostedQuestions().forEach(component => components.push(component));
        } else if (child.component.isFormElement()) {
          components.push(child as QuestionViewComponent);
        }
      }
    }

    return components;
  }

  isVisible(): boolean {
    return this.visible;
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
  }
}
