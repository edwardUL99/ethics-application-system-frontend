import { ChangeDetectorRef, Component, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { QuestionChange, QuestionViewComponent, QuestionViewComponentShape, QuestionChangeEvent, ViewComponentShape } from '../application-view.component';
import { MultipartQuestionComponent, QuestionBranch } from '../../../models/components/multipartquestioncomponent';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { FormGroup } from '@angular/forms';
import { QuestionComponentHost, MatchedQuestionComponents } from '../component-host.directive';
import { ComponentViewRegistration } from '../registered.components';
import { AbstractComponentHost } from '../abstractcomponenthost';
import { DynamicComponentLoader } from '../dynamiccomponents';
import { Application } from '../../../models/applications/application';
import { Answer } from '../../../models/applications/answer';
import { QuestionViewUtils } from '../questionviewutils';

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
  @Input() visible: boolean;

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

    if (questionData.questionChangeCallback) {
      this.questionChange.register(questionData.questionChangeCallback);
    }
  }

  private displayPart(part: string) {
    const question = this.multipartQuestion.parts[part];

    if (!this.multipartQuestion.conditional || !this.edit()) {
      this.displayedParts[part] = question.question.componentId in this.application?.answers;
    } else {
      this.setDisplayedPart(part);
    }
  }

  ngOnInit(): void {
    this.group = new FormGroup({});
    this.multipartQuestion = this.castComponent();
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

  loadComponents(): void {
    const thisInstance = this; // capture the instance of this to pass into callback

    for (let key of Object.keys(this.multipartQuestion.parts)) {
      const part = this.multipartQuestion.parts[key];

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
            questionChangeCallback: callback
          };
          this.matchedComponents[part.partName] = this.loadComponent(this.loader, part.question.componentId, data).instance as QuestionViewComponent;
        }
      }
    }

    Object.keys(this.multipartQuestion.parts).forEach(key => this.displayPart(key));

    this.detectChanges();
    this.propagateEmits();
    this.removeNotDisplayedFromForm(); // TODO make sure this works
  }

  private removeNotDisplayedFromForm() {
    if (this.edit()) {
      // remove any components that are not displayed from the form
      for (let key of Object.keys(this.multipartQuestion.parts)) {
        const part = this.multipartQuestion.parts[key];
        if (!this.displayedParts[part.partName]) {
          this.matchedComponents[part.partName].removeFromForm();
        }
      }
    }
  }

  private propagateEmits() {
    for (let key of Object.keys(this.matchedComponents)) {
      if (this.matchedComponents[key].edit()) {
        this.matchedComponents[key].emit();
      }
    }
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

  addToForm(): void {
    if (this.edit() && !this.form.get(this.multipartQuestion.componentId)) {
      this.form.addControl(this.multipartQuestion.componentId, this.group);
    }
  }

  removeFromForm(): void {
    this.form.removeControl(this.multipartQuestion.componentId);
  }

  castComponent() {
    return this.component as MultipartQuestionComponent;
  }

  propagateQuestionChange(questionChange: QuestionChange, e: QuestionChangeEvent) {
    // TODO no-op for now, may be needed
  }

  emit() {
    this.questionChange.emit(new QuestionChangeEvent(this.component.componentId, this));
  }

  private evaluateBranches(view: QuestionViewComponent, branches: QuestionBranch[], hide?: boolean) {
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
      this.matchedComponents[part].setVisible(display);

      if (display) {
        this.matchedComponents[part].addToForm();
      } else {
        this.matchedComponents[part].removeFromForm();
        
        if (this.matchedComponents[part].component.componentId in this.application?.answers) {
          delete this.application.answers[this.matchedComponents[part].component.componentId];
        }

        const partBranches = this.multipartQuestion.parts[part].branches;
        this.evaluateBranches(undefined, partBranches, false);
      }
    }
  }

  onInput(event: QuestionChangeEvent, part: string, emitEvent: boolean = true) {
    if (this.multipartQuestion.conditional) {
      const branches = this.multipartQuestion.parts[part].branches;
      this.evaluateBranches(event.view, branches);
    }

    if (emitEvent) {
      this.emit();
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

  edit(): boolean {
    for (let key of Object.keys(this.matchedComponents)) {
      const component = this.matchedComponents[key];
      if (QuestionViewUtils.edit(component, false)) {
        return true;
      }
    }

    return false;
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
}
