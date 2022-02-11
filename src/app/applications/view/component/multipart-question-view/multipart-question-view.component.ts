import { ChangeDetectorRef, Component, Input, OnInit, Output, ViewChildren, OnChanges } from '@angular/core';
import { QuestionChange, QuestionChangeCallback, QuestionViewComponent, QuestionViewComponentShape, QuestionChangeEvent, ViewComponentShape } from '../application-view.component';
import { MultipartQuestionComponent } from '../../../models/components/multipartquestioncomponent';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { FormGroup } from '@angular/forms';
import { QuestionComponentHost, ComponentHostDirective } from '../component-host.directive';
import { ViewComponentRegistration, registeredComponents } from '../registered.components';
import { ObjectValueType, ValueType } from '../valuetype';
import { AbstractComponentHost } from '../abstractcomponenthost';

/**
 * A map type for use in identifying if a part is displayed or not
 */
type DisplayedParts = {
  [key: string]: boolean
};

/**
 * The mapping for matched parts and component host directives
 */
type MatchedComponentHosts = {
  [key: string]: ComponentHostDirective
}

/** 
 * The mapping of question view components
 */
type MatchedQuestionComponents = {
  [key: string]: QuestionViewComponent
}

/**
 * Mapping of part values
 */
type PartValues = {
  [key: string]: ValueType
}

@Component({
  selector: 'app-multipart-question-view',
  templateUrl: './multipart-question-view.component.html',
  styleUrls: ['./multipart-question-view.component.css']
})
@ViewComponentRegistration(ComponentType.MULTIPART_QUESTION)
export class MultipartQuestionViewComponent extends AbstractComponentHost implements OnInit, QuestionViewComponent, QuestionComponentHost, OnChanges {
  /**
   * The component being rendered by this view
   */
  @Input() component: ApplicationComponent;
  /**
   * The multipart question component cast from the compoennt
   */
  multipartQuestion: MultipartQuestionComponent;
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
   * Determines if all the directives have been loaded and bound to
   */
  directivesLoaded: boolean = false;
  /**
   * The question change event emitter
   */
  @Output() questionChange: QuestionChange = new QuestionChange();
  /**
   * The list of component hosts found in the view
   */
  @ViewChildren(ComponentHostDirective)
  private componentHosts: ComponentHostDirective[];
  /**
   * The matched component hosts with the question parts
   */
  private matchedComponentHosts: MatchedComponentHosts = {}
  /**
   * The matched question view components
   */
  private matchedComponents: MatchedQuestionComponents = {}; 
  /**
   * The part values
   */
  private values: PartValues = {};
  /**
   * Determines if the view has been initialised or not
   */
  private _viewInitialised: boolean = false;
  /** 
   * The allowed types for the part questions
   */
  private readonly allowedQuestionParts = [ComponentType.TEXT_QUESTION, ComponentType.SELECT_QUESTION, ComponentType.CHECKBOX_QUESTION, ComponentType.RADIO_QUESTION];

  constructor(private readonly cd: ChangeDetectorRef) {
    super();
  }

  initialise(data: ViewComponentShape): void {
    const questionData = data as QuestionViewComponentShape;
    this.component = questionData.component;
    this.form = questionData.form;

    if (questionData.questionChangeCallback) {
      this.questionChange.register(questionData.questionChangeCallback);
    }
  }

  ngOnInit(): void {
    this.group = new FormGroup({});
    this.multipartQuestion = this.castComponent();
    this.addToForm();

    for (let key of Object.keys(this.multipartQuestion.parts)) {
      if (!this.multipartQuestion.conditional) {
        this.displayedParts[key] = true;
      } else {
        this.setDisplayedPart(key);
      }
    }
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
    for (let key of Object.keys(this.multipartQuestion.parts)) {
      const part = this.multipartQuestion.parts[key];

      if (this.matchedComponents[part.partName] == undefined) {
        // only load the component if it has not been loaded before
        const hostDirective = this.matchedComponentHosts[part.partName];

        if (hostDirective == undefined) {
          throw new Error("No componentHost directive has been found with [hostId] set to the componentId of the question: " + part.question.componentId);
        }

        const type = part.question.getType();
          
        if (this.validComponent(type)) {
          throw new Error(`The component type ${type} is not a supported question type in a MultipartQuestion`)
        } else {
          const questionChangeCallback = (e: QuestionChangeEvent) => this.onInput(e, part.partName);

          this.matchedComponents[part.partName] = this.loadComponent(hostDirective, part.question, this.group, questionChangeCallback).instance as QuestionViewComponent;
        }
      }
    }

    this.detectChanges();
  }

  private loadDirectives() {
    this.multipartQuestion = this.castComponent();

    for (let hostDirective of this.componentHosts) {
      const componentId = hostDirective.hostId;

      for (let key of Object.keys(this.multipartQuestion.parts)) {
        const part = this.multipartQuestion.parts[key];
        
        if (part.question.componentId == componentId) {
          // If the componentId of this part's question matches the hostId directive property, we have found a matched host for the question
          this.matchedComponentHosts[part.partName] = hostDirective;
        }
      }
    }
  }

  ngAfterViewInit(): void {
    this._viewInitialised = true;
  }

  /**
   * Initialise/set displayed parts for the given part name`
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
    if (!this.form.get(this.multipartQuestion.componentId)) {
      this.form.addControl(this.multipartQuestion.componentId, this.group);
    }
  }

  removeFromForm(): void {
    this.form.removeControl(this.multipartQuestion.componentId);
  }

  ngOnChanges(): void {
    if (this._viewInitialised) {
      if (!this.directivesLoaded) {
        this.loadDirectives();
        this.directivesLoaded = true;
      }

      this.loadComponents();
    }
  }

  castComponent() {
    return this.component as MultipartQuestionComponent;
  }

  value(): ValueType {
    const copiedParts = {};

    Object.keys(this.values).forEach(part => {
      const partComponent = this.multipartQuestion.parts[part].question.componentId;
      const value = this.matchedComponents[part].value();

      copiedParts[partComponent] = value;
    });

    return new ObjectValueType(copiedParts);
  }

  onInput(event: any, part: string) {
    const partComponent = this.matchedComponents[part];
    const value = partComponent.value();
    this.values[part] = value;

    if (this.multipartQuestion.conditional) {
      const branches = this.multipartQuestion.parts[part].branches;

      for (let branch of branches) {
        let part = branch.part;
        let branchValue = branch.value;
        const display: boolean = value.matches(branchValue);

        this.displayedParts[part] = display;

        if (display) {
          this.matchedComponents[part].addToForm();
        } else {
          this.matchedComponents[part].removeFromForm();

          if (part in this.values) {
            // if the part isn't displayed anymore, we don't consider its value
            delete this.values[part];
          }
        }
      }
    }

    this.questionChange.emit(new QuestionChangeEvent(this.component.componentId, this.value()));
  }

  detectChanges(): void {
    this.cd.detectChanges();
  }
}
