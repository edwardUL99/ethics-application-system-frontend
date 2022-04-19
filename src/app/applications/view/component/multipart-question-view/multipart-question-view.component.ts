import { ChangeDetectorRef, Component, Input, OnInit, Output, OnDestroy, ComponentRef } from '@angular/core';
import { QuestionChange, QuestionViewComponent, QuestionViewComponentShape, QuestionChangeEvent, ViewComponentShape, ApplicationViewComponent } from '../application-view.component';
import { MultipartQuestionComponent, QuestionBranch, QuestionPart } from '../../../models/components/multipartquestioncomponent';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { FormGroup } from '@angular/forms';
import { QuestionComponentHost, MatchedQuestionComponents } from '../component-host.directive';
import { ComponentViewRegistration } from '../registered.components';
import { AbstractComponentHost } from '../abstractcomponenthost';
import { DynamicComponentLoader } from '../dynamiccomponents';
import { Application } from '../../../models/applications/application';
import { Answer } from '../../../models/applications/answer';
import { QuestionViewUtils } from '../questionviewutils';
import { ApplicationStatus } from '../../../models/applications/applicationstatus';
import { AutosaveContext } from '../autosave';
import { ComponentDisplayContext } from '../displaycontext';
import { resolveStatus } from '../../../models/requests/mapping/applicationmapper';

/**
 * A map type for use in identifying if a part is displayed or not
 */
type DisplayedParts = {
  [key: string]: boolean
};

// static call to use as callback
function onInputStatic(component: MultipartQuestionViewComponent, event: QuestionChangeEvent, part: string) {
  component.onInput(event, part);
}

@Component({
  selector: 'app-multipart-question-view',
  templateUrl: './multipart-question-view.component.html',
  styleUrls: ['./multipart-question-view.component.css']
})
@ComponentViewRegistration(ComponentType.MULTIPART_QUESTION)
export class MultipartQuestionViewComponent extends AbstractComponentHost implements OnInit, QuestionViewComponent, QuestionComponentHost, OnDestroy {
  /**
   * The component being rendered by this view
   */
  @Input() component: ApplicationComponent;
  /**
   * The parent component if it exists
   */
  @Input() parent: QuestionViewComponent;
  /**
   * The multipart question component cast from the compoennt
   */
  multipartQuestion: MultipartQuestionComponent;
  /**
   * The current application object
   */
  @Input() application: Application;
  /**
   * The form passed into the view component
   */
  @Input() form: FormGroup;
  /**
   * This question's specific group. For sub-questions of this component, it is passed to the questions
   * instead of the main form component passed in from this component's parent
   */
  group: FormGroup;
  /**
   * A mapping of part name to boolean to determine if the part should be displayed
   */
  displayedParts: DisplayedParts = {}
  /**
   * The question change event emitter
   */
  @Output() questionChange: QuestionChange = new QuestionChange();
  /**
   * The matched question view components
   */
  private matchedComponents: MatchedQuestionComponents = {}; 
  /**
   * Determines if the view has been initialised or not
   */
  private _viewInitialised: boolean = false;
  /** 
   * The allowed types for the part questions
   */
  private readonly allowedQuestionParts = [ComponentType.TEXT_QUESTION, ComponentType.SELECT_QUESTION, ComponentType.CHECKBOX_QUESTION, ComponentType.RADIO_QUESTION];
  /**
   * Determines if the component is visible
   */
  @Input() visible: boolean = true;
  /**
   * The autosave context to pass to children
   */
  autosaveContext: AutosaveContext;
  /**
   * The display context the view component is being rendered inside
   */
  @Input() context: ComponentDisplayContext;

  constructor(private readonly cd: ChangeDetectorRef,
    private loader: DynamicComponentLoader) {
    super();
  }

  initialise(data: ViewComponentShape): void {
    const questionData = data as QuestionViewComponentShape;
    this.component = questionData.component;
    this.parent = questionData.parent;
    this.application = data.application;
    this.form = questionData.form;
    this.autosaveContext = questionData.autosaveContext;
    this.context = questionData.context;

    if (questionData.questionChangeCallback) {
      this.questionChange.register(questionData.questionChangeCallback);
    }
  }

  ngOnInit(): void {
    this.group = new FormGroup({});
    this.addToForm();
  }

  ngOnDestroy(): void {
    this.questionChange.destroy();
    Object.keys(this.multipartQuestion.parts).forEach(part => this.loader.destroyComponents(this.multipartQuestion.parts[part].question.componentId));
    this.removeFromForm();
  }

  viewInitialised(): boolean {
    return this._viewInitialised;
  }

  getParts() {
    const parts = [];
    Object.keys(this.multipartQuestion.parts).forEach(key => parts.push(this.multipartQuestion.parts[key]));

    return parts;
  }

  validComponent(componentType: ComponentType): boolean {
    return this.allowedQuestionParts.indexOf(componentType) != -1;
  }

  private loadPart(part: QuestionPart): ComponentRef<ApplicationViewComponent> {
    const thisInstance = this; // capture the instance of this to pass into callback

    if (this.matchedComponents[part.partName] == undefined) {
      // only load the component if it has not been loaded before
      const type = part.question.getType();
        
      if (!this.validComponent(type)) {
        throw new Error(`The component type ${type} is not a supported question type in a MultipartQuestion`)
      } else {
        const callback = (e: QuestionChangeEvent) => onInputStatic(thisInstance, e, part.partName);
        const data: QuestionViewComponentShape = {
          application: this.application,
          component: part.question,
          form: this.group,
          parent: this,
          questionChangeCallback: callback,
          autosaveContext: this.autosaveContext,
          context: this.context
        };

        const ref = this.loadComponent(this.loader, part.question.componentId, this.context.autofillNotifier, data, true);
        this.loader.registerReference(part.question.componentId, ref);
        this.matchedComponents[part.partName] = ref.instance as QuestionViewComponent;

        return ref;
      }
    }
  }

  private unloadPart(part: QuestionPart) {
    if (this.matchedComponents[part.partName]) {
      this.loader.getLoadedComponents(part.question.componentId).forEach(c => c.destroy());
      this.loader.deleteReference(part.question.componentId);
      delete this.matchedComponents[part.partName];
    }
  }

  loadComponents(): void {
    const refs = [];

    Object.keys(this.multipartQuestion.parts).forEach(key => this.setDisplayedPart(key));
    Object.keys(this.displayedParts)
      .filter(key => this.displayedParts[key])
      .forEach(key => refs.push(this.loadPart(this.multipartQuestion.parts[key])));
    Object.keys(this.matchedComponents)
      .forEach(key => this.matchedComponents[key].displayAnswer());
    refs.forEach(ref => ref.changeDetectorRef.detectChanges());

    this.detectChanges();
  }

  ngAfterViewInit(): void {
    this._viewInitialised = true;
    this.loadComponents();
  }

  /**
   * Initialise/set displayed parts for the given part name
   * @param partName the name of the part to set/initialise the displayed part
   */
  private setDisplayedPart(partName: string) {
    const part = this.multipartQuestion.parts[partName];
    this.displayedParts[partName] = true; // assume it will be displayed first unless proven otherwise
    
    if (this.multipartQuestion.conditional && this.edit()) {
      for (let key of Object.keys(this.multipartQuestion.parts)) {
        const otherPart = this.multipartQuestion.parts[key];

        if (otherPart !== part) {
          for (let branch of otherPart.branches) {
            if (branch.part == part.partName) { // if the current part name is identified as a 'branch' to part, don't display it as it will only be displayed on a matched value condition
              this.displayedParts[partName] = false;
            }
          }
        }
      }
    }
  }

  addToForm(): void {
    this.multipartQuestion = this.castComponent();
    if (!this.form.get(this.multipartQuestion.componentId)) {
      this.form.addControl(this.multipartQuestion.componentId, this.group);
    }
  }

  removeFromForm(): void {
    if (this.multipartQuestion) {
      this.form.removeControl(this.multipartQuestion.componentId);
      this.group = undefined;
    }
  }

  questionName(): string {
    return this.multipartQuestion.componentId;
  }

  castComponent() {
    return this.component as MultipartQuestionComponent;
  }

  propagateQuestionChange(questionChange: QuestionChange, e: QuestionChangeEvent) {
    // no-op
  }

  emit(autosave: boolean, emitChange: boolean = true): void {
    const e = new QuestionChangeEvent(this.component.componentId, this, autosave);
    
    if (emitChange)
      this.questionChange.emit(e);
  }

  private evaluateBranches(view: QuestionViewComponent, branches: QuestionBranch[], hide?: boolean, unloadParts: string[] = []) {
    for (let branch of branches) {
      let part = branch.part;
      let branchValue = branch.value;
      let display: boolean;
      
      if (hide != undefined) {
        display = hide;
      } else {
        display = (view.value() as Answer).matches(branchValue);
      }

      this.displayedParts[part] = display;

      if (display) {
        const ref = this.loadPart(this.multipartQuestion.parts[part]);

        if (ref) {
          ref.changeDetectorRef.detectChanges();
        }

        this.matchedComponents[part].addToForm();
      } else {
        if (this.matchedComponents[part]) {
          this.matchedComponents[part].removeFromForm();
          unloadParts.push(part);

          if (this.matchedComponents[part].component.componentId in this.application?.answers) {
            delete this.application.answers[this.matchedComponents[part].component.componentId];
          }
  
          const partBranches = this.multipartQuestion.parts[part].branches;
          this.evaluateBranches(undefined, partBranches, false, unloadParts);
        }
      }
    }

    unloadParts.forEach(part => this.unloadPart(this.multipartQuestion.parts[part]));
  }

  onInput(event: QuestionChangeEvent, part: string, emitEvent: boolean = true) {
    if (this.multipartQuestion.conditional) {
      const branches = this.multipartQuestion.parts[part].branches;
      this.evaluateBranches(event.view, branches);
    }

    if (emitEvent) {
      this.emit(event.autosave);
    } 
  }

  detectChanges(): void {
    this.cd.detectChanges();
  }

  display(): boolean {
    for (let key of Object.keys(this.matchedComponents)) {
      const component = this.matchedComponents[key];

      if (QuestionViewUtils.display(component as QuestionViewComponent, false)) {
        return true;
      }
    }

    return false;
  }

  isReferredEdit() {
    return this.multipartQuestion.conditional && this.context?.viewingUser?.applicant &&
      (resolveStatus(this.application?.status) == ApplicationStatus.REFERRED && this.atLeastOneEditable());
  }

  private atLeastOneEditable() {
    if (this.application.editableFields) {
      for (let key in this.matchedComponents) {
        if (this.application.editableFields.indexOf(this.matchedComponents[key].component.componentId) != -1) {
          return true;
        }
      }
    }

    return false;
  }

  edit(): boolean {
    if (!this.multipartQuestion.conditional) {
      return false;
    } else {
      // require all the question to be editable if the child is required to be edited
      const status = resolveStatus(this.application.status);

      if (status == ApplicationStatus.DRAFT) {
        return true;
      } else if (status == ApplicationStatus.REFERRED) {
        return this.atLeastOneEditable();
      }

      return false;
    }
  }

  setFromAnswer(answer: Answer): void {
    const subComponents: QuestionViewComponent[] = 
      this.loader.getLoadedComponents(this.component.componentId).filter(view => view.instance.component.componentId == answer.componentId).map(c => c.instance as QuestionViewComponent);
    
    if (subComponents.length == 1) {
      subComponents[0].setFromAnswer(answer);
    }
  }

  value(): Answer[] {
    const answers: Answer[] = [];

    Object.keys(this.matchedComponents).forEach(key => answers.push(this.matchedComponents[key].value() as Answer));

    return answers;
  }

  isVisible(): boolean {
    return this.visible;
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
  }

  getHostedQuestions(): QuestionViewComponent[] {
    const components = [];

    for (let key of Object.keys(this.matchedComponents)) {
      components.push(this.matchedComponents[key]);
    }

    return components;
  }

  displayAnswer(): boolean {
    return true; // no-op
  }

  setDisabled(disabled: boolean): void {
    Object.keys(this.matchedComponents).forEach(key => this.matchedComponents[key].setDisabled(disabled));
  }

  markRequired(): void {
    // no-op
  }
}
