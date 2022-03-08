import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ApplicationTemplateContext, ReplacedContainer } from '../../applicationtemplatecontext';
import { ApplicationTemplate } from '../../models/applicationtemplate';
import { ApplicationComponent, ComponentType } from '../../models/components/applicationcomponent';
import { AbstractComponentHost } from '../component/abstractcomponenthost';
import { QuestionChange, QuestionChangeEvent, QuestionViewComponentShape } from '../component/application-view.component';
import { ComponentHost } from '../component/component-host.directive';
import { DynamicComponentLoader } from '../component/dynamiccomponents';
import { SectionViewComponent, SectionViewComponentShape } from '../component/section-view/section-view.component';
import { AutofillResolver, setResolver } from '../../autofill/resolver';
import { Application } from '../../models/applications/application';
import { ViewingUser } from '../../applicationcontext';
import { ApplicationStatus } from '../../models/applications/applicationstatus';
import { ContainerComponent } from '../../models/components/containercomponent';
import { CompositeComponent } from '../../models/components/compositecomponent';

/*
TODO when gathering answers from fields, any non-editable and autofilled fields should be propagated and stored in the answers.
Test that this happens when you get this far 
*/

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
   * An event that indicates that the application being filled out should be terminated
   */
  @Output() terminate: EventEmitter<boolean> = new EventEmitter<boolean>();
  /**
   * The user viewing the application
   */
  @Input() viewingUser: ViewingUser;
  /**
   * A variable to indicate if the view is initialised or not
   */ 
  private _viewInitialised: boolean = false;

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
    this.autoSave.emit(section);
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
        template: this
      };

      this.loadComponentSubSection(this.loader, '', data);
    } else {
      const data: QuestionViewComponentShape = {
        application: this.application,
        form: this.form,
        questionChangeCallback: callback,
        component: component,
        template: this
      };

      this.loadComponent(this.loader, '', data);
    }
  }

  loadComponents(): void {
    if (this._viewInitialised && this.application) {
      this.template.components.forEach(component => this._loadComponent(component));
    }

    this.detectChanges()
  }

  detectChanges(): void {
    this.cd.detectChanges();
  }

  terminateApplication() {
    if (this.application.status == ApplicationStatus.DRAFT) {
      this.terminate.emit(true);
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

  // TODO need to make sure that autosaving still works after this

  loadNewContainer(replaced: ReplacedContainer) {
    // TODO this sometimes throws null
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
}
