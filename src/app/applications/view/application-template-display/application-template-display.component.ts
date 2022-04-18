import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ApplicationTemplateContext, ReplacedContainer } from '../../applicationtemplatecontext';
import { ApplicationTemplate } from '../../models/applicationtemplate';
import { ApplicationComponent, ComponentType } from '../../models/components/applicationcomponent';
import { AbstractComponentHost } from '../component/abstractcomponenthost';
import { ActionBranchSource, AutosaveSource, QuestionChange, QuestionChangeEvent, QuestionViewComponent, QuestionViewComponentShape } from '../component/application-view.component';
import { ComponentHost } from '../component/component-host.directive';
import { DynamicComponentLoader } from '../component/dynamiccomponents';
import { SectionViewComponentShape } from '../component/section-view/section-view.component';
import { AutofillResolver, setResolver } from '../../autofill/resolver';
import { Application } from '../../models/applications/application';
import { ViewingUser } from '../../applicationcontext';
import { ApplicationStatus } from '../../models/applications/applicationstatus';
import { ContainerComponent } from '../../models/components/containercomponent';
import { CompositeComponent } from '../../models/components/compositecomponent';
import { AutofillNotifier } from '../../autofill/autofillnotifier';
import { ComponentDisplayContext } from '../component/displaycontext';
import { QuestionComponent } from '../../models/components/questioncomponent';
import { RequestedAnswers } from '../answer-requests/requestedanswers';
import { resolveStatus } from '../../models/requests/mapping/applicationmapper';

/**
 * A type to determine if an autosave event has already been dispatched for the section
 */
export type AutosaveDispatched = {
  [key: string]: boolean;
}

@Component({
  selector: 'app-application-template-display',
  templateUrl: './application-template-display.component.html',
  styleUrls: ['./application-template-display.component.css']
})
export class ApplicationTemplateDisplayComponent extends AbstractComponentHost implements OnInit, ComponentHost, AfterViewInit, OnDestroy, ComponentDisplayContext {
  /**
   * The template context instance
   */
  private templateContext: ApplicationTemplateContext = ApplicationTemplateContext.getInstance();
  /**
   * The current template to display
   */
  @Input() template: ApplicationTemplate;
  /**
   * The form group instance to pass to the child components
   */
  form: FormGroup;
  /**
   * The object representing the current application
   */
  @Input() application: Application;
  /**
   * The output to propagate question changes up
   */
  @Output() questionChange: QuestionChange = new QuestionChange();
  /**
   * Event for when a section is autosaved to tell the parent to autosave
   */
  @Output() autoSave: EventEmitter<AutosaveSource> = new EventEmitter<AutosaveSource>();
  /**
   * An event notifying that a checkbox group component has an attach-file branch triggered
   */
  @Output() attachFile: EventEmitter<ActionBranchSource> = new EventEmitter<ActionBranchSource>();
  /**
   * An event that indicates that the application being filled out should be terminated
   */
  @Output() terminate: EventEmitter<ActionBranchSource> = new EventEmitter<ActionBranchSource>();
  /**
   * The autofill notifier to notify of autofill events taking place
   */
  @Output('autofilled') autofillNotifier: AutofillNotifier = new AutofillNotifier();
  /**
   * The user viewing the application
   */
  @Input() viewingUser: ViewingUser;
  /**
   * IDs of components to hide
   */
  @Input() hiddenComponents: string[];
  /**
   * Determine if edits should be disabled
   */
  @Input() editsDisabled: boolean = false;
  /**
   * The requested answers received by the context
   */
  private requestedAnswers: RequestedAnswers = new RequestedAnswers();
  /**
   * A variable to indicate if the view is initialised or not
   */ 
  private _viewInitialised: boolean = false;
  /**
   * Record if the section already has an autosave dispatched
   */
  private dispatchedAutosaves: AutosaveDispatched = {};
  /**
   * Notifies of when a requested answer request has been made
   */
  answerRequestSubmitted: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private cd: ChangeDetectorRef, private loader: DynamicComponentLoader) {
    super();
  }

  ngOnInit(): void {
    if (!this.template) {
      this.template = this.templateContext.getCurrentTemplate();

      if (!this.template) {
        throw new Error('You need to set the current template before creating an application-template-display component');
      }

      setResolver(AutofillResolver.fromConfig()); // initialise the autofill for the application templates
    }

    this.form = new FormGroup({});
  }

  ngAfterViewInit(): void {
    this._viewInitialised = true;
    this.loadComponents();
  }

  ngOnDestroy(): void {
    this.questionChange.destroy();
    this.autofillNotifier.destroy();
    this.loader.destroyComponents();
    setResolver(undefined); // clean up and remove the set autofill resolver
  }

  viewInitialised(): boolean {
    return this._viewInitialised;
  }

  propagateQuestionChange(questionChange: QuestionChange, e: QuestionChangeEvent) {
    questionChange.emit(e);
  }

  autosave(source: AutosaveSource) {
    const id = source.getComponentId();

    if (!this.dispatchedAutosaves[id]) {
      this.autoSave.emit(source);
      this.dispatchedAutosaves[id] = true;
    }
  }

  markAutosaved(source: AutosaveSource): void {
    delete this.dispatchedAutosaves[source.getComponentId()];   
  }

  private _loadComponent(component: ApplicationComponent) {
    const callback = (e: QuestionChangeEvent) => this.propagateQuestionChange(this.questionChange, e);

    if (component.getType() == ComponentType.SECTION) {
      const data: SectionViewComponentShape = {
        component: component,
        application: this.application,
        form: this.form,
        subSection: false,
        questionChangeCallback: callback,
        context: this,
        autosaveContext: undefined
      };

      this.loadComponentSubSection(this.loader, '', data);
    } else {
      const data: QuestionViewComponentShape = {
        application: this.application,
        form: this.form,
        questionChangeCallback: callback,
        component: component,
        context: this,
        autosaveContext: undefined
      };

      this.loadComponent(this.loader, '', this.autofillNotifier, data);
    }
  }

  loadComponents(): void {
    if (this._viewInitialised && this.application) {
      this.template.components.forEach(component => this._loadComponent(component));
    }

    this.form.updateValueAndValidity();
    this.detectChanges()
  }

  detectChanges(): void {
    this.cd.detectChanges();
  }

  terminateApplication(checkbox: ActionBranchSource) {
    if (this.application.status == ApplicationStatus.DRAFT) {
      this.terminate.emit(checkbox);
    }
  }

  attachFileToApplication(checkbox: ActionBranchSource) {
    if (this.application.status == ApplicationStatus.DRAFT || this.application.status == ApplicationStatus.REFERRED) {
      this.attachFile.emit(checkbox);
    }
  }

  private _deleteOldComponent(component: ApplicationComponent, hostIds: string[]) {
    if (component.isComposite) {
      hostIds.push(component.componentId);
      for (let sub of (component as CompositeComponent).getComponents()) {
        this._deleteOldComponent(sub, hostIds); // recursively delete the child components
      }
    } else {
      if (component.componentId in this.application.answers) {
        delete this.application.answers[component.componentId];
      }
    }
  }

  private _deleteOldComponentViews(hostIds: string[]) {
    hostIds.forEach(id => {
      this.loader.destroyComponents(id);
      this.loader.deleteReference(id);
    });
  }

  private _clearOldContainerComponents(component: ContainerComponent) {
    const hostIds = [];
    component.components.forEach(component => this._deleteOldComponent(component, hostIds));
    this._deleteOldComponentViews(hostIds);
  }

  private _loadNewContainer(component: ContainerComponent) {
    component.components.forEach(component => this._loadComponent(component));
  }

  loadNewContainer(replaced: ReplacedContainer) {
    if (!(replaced.replaced instanceof ContainerComponent) || !(replaced.container instanceof ContainerComponent)) {
      console.warn('Invalid container components passed into loadNewContainer on template display');
    } else {
      const oldContainer: ContainerComponent = replaced.replaced as ContainerComponent;
      const newContainer: ContainerComponent = replaced.container as ContainerComponent;

      this._clearOldContainerComponents(oldContainer);
      this._loadNewContainer(newContainer);
    }

    this.application.applicationTemplate = this.templateContext.getCurrentTemplate();
  }

  reload() {
    this.questionChange.destroy();
    this.loader.getLoadedComponents('').forEach(c => c.destroy());
    this.loadComponents();
  }

  answerRequestEnabled(): boolean {
    return true;
  }

  allowAnswerEdit(): boolean {
    return !this.editsDisabled;
  }

  onAnswerRequested(component: QuestionComponent, username: string, remove?: boolean): void {
    if (remove) {
      this.requestedAnswers.removeRequest(username, component);
    } else {
      this.requestedAnswers.addRequest(username, component);
    }
  }

  getRequestedAnswers(): RequestedAnswers {
    return this.requestedAnswers;
  }

  displayComponent(component: QuestionViewComponent): boolean {
    if (!this.hiddenComponents) {
      return true;
    } else {
      return this.hiddenComponents.indexOf(component.component.componentId) == -1;
    }
  }

  displayAndDisableComponent(component: QuestionViewComponent): boolean {
    if (this.editsDisabled) {
      component.setDisabled(true);
      
      return true;
    } else {
      return false;
    }
  }

  getRequiredText() {
    if (this.application.status) {
      const status = resolveStatus(this.application.status);

      if (status == ApplicationStatus.DRAFT) {
        return 'Marks a required question';
      } else if (status == ApplicationStatus.REFERRED) {
        return 'Marks a question that requires additional input';
      }
    }

    return undefined;
  }
}
