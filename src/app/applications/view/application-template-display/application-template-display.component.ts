import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ApplicationTemplateContext, ReplacedContainer } from '../../applicationtemplatecontext';
import { ApplicationTemplate } from '../../models/applicationtemplate';
import { ApplicationComponent, ComponentType } from '../../models/components/applicationcomponent';
import { AbstractComponentHost } from '../component/abstractcomponenthost';
import { QuestionChange, QuestionChangeEvent, QuestionViewComponentShape } from '../component/application-view.component';
import { ComponentHost, LoadedComponentsChange } from '../component/component-host.directive';
import { DynamicComponentLoader } from '../component/dynamiccomponents';
import { SectionViewComponent, SectionViewComponentShape } from '../component/section-view/section-view.component';
import { AutofillResolver, setResolver } from '../../autofill/resolver';
import { Application } from '../../models/applications/application';
import { ViewingUser } from '../../applicationcontext';
import { ApplicationStatus } from '../../models/applications/applicationstatus';
import { ContainerComponent } from '../../models/components/containercomponent';
import { CompositeComponent } from '../../models/components/compositecomponent';
import { CheckboxGroupViewComponent } from '../component/checkbox-group-view/checkbox-group-view.component';

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
export class ApplicationTemplateDisplayComponent extends AbstractComponentHost implements OnInit, ComponentHost, AfterViewInit, OnDestroy {
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
  @Output() autoSave: EventEmitter<SectionViewComponent> = new EventEmitter<SectionViewComponent>();
  /**
   * An event notifying that a checkbox group component has an attach-file branch triggered
   */
  @Output() attachFile: EventEmitter<CheckboxGroupViewComponent> = new EventEmitter<CheckboxGroupViewComponent>();
  /**
   * An event that indicates that the application being filled out should be terminated
   */
  @Output() terminate: EventEmitter<CheckboxGroupViewComponent> = new EventEmitter<CheckboxGroupViewComponent>();
  /**
   * The user viewing the application
   */
  @Input() viewingUser: ViewingUser;
  /**
   * A variable to indicate if the view is initialised or not
   */ 
  private _viewInitialised: boolean = false;
  /**
   * An emitter to emit when loaded components change
   */
  @Output() componentsChange: LoadedComponentsChange = new LoadedComponentsChange();
  /**
   * Record if the section already has an autosave dispatched
   */
  private dispatchedAutosaves: AutosaveDispatched = {};

  constructor(private cd: ChangeDetectorRef, private loader: DynamicComponentLoader) {
    super();
  }

  ngOnInit(): void {
    this.template = this.templateContext.getCurrentTemplate();

    if (!this.template) {
      throw new Error('You need to set the current template before creating an application-template-display component');
    }

    this.form = new FormGroup({});
    setResolver(AutofillResolver.fromConfig()); // initialise the autofill for the application templates
  }

  ngAfterViewInit(): void {
    this._viewInitialised = true;
    this.loadComponents();
  }

  ngOnDestroy(): void {
    this.questionChange.destroy();
    this.componentsChange.destroy();
    this.loader.destroyComponents();
    setResolver(undefined); // clean up and remove the set autofill resolver
  }

  viewInitialised(): boolean {
    return this._viewInitialised;
  }

  propagateQuestionChange(questionChange: QuestionChange, e: QuestionChangeEvent) {
    questionChange.emit(e);
  }

  autoSaveSection(section: SectionViewComponent) {
    const id = section.component.componentId;

    if (!this.dispatchedAutosaves[id]) {
      this.autoSave.emit(section);
      this.dispatchedAutosaves[id] = true;
    }
  }

  markSectionSaved(section: SectionViewComponent) {
    delete this.dispatchedAutosaves[section.component.componentId];
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
        template: this,
        autosaveContext: undefined
      };

      this.loadComponentSubSection(this.loader, '', data);
    } else {
      const data: QuestionViewComponentShape = {
        application: this.application,
        form: this.form,
        questionChangeCallback: callback,
        component: component,
        template: this,
        autosaveContext: undefined
      };

      this.loadComponent(this.loader, '', data);
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

  terminateApplication(checkbox: CheckboxGroupViewComponent) {
    if (this.application.status == ApplicationStatus.DRAFT) {
      this.terminate.emit(checkbox);
    }
  }

  attachFileToApplication(checkbox: CheckboxGroupViewComponent) {
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
}
