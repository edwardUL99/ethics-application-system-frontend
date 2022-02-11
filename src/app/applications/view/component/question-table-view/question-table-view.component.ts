import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, Output, ViewChildren } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { QuestionComponent } from '../../../models/components/questioncomponent';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { QuestionTableComponent } from '../../../models/components/questiontablecomponent';
import { AbstractComponentHost } from '../abstractcomponenthost';
import { QuestionChange, QuestionChangeEvent, QuestionViewComponent, QuestionViewComponentShape, ViewComponentShape } from '../application-view.component';
import { ComponentHostDirective, MatchedComponentHosts, MatchedQuestionComponents, QuestionComponentHost } from '../component-host.directive';
import { ObjectValueType, ValueType } from '../valuetype';
import { ViewComponentRegistration } from '../registered.components';
import { DynamicComponentLoader } from '../dynamiccomponents';

/**
 * Mapping of question values
 */
type QuestionValues = {
  [key: string]: ValueType
}

/**
 * A mapping of question component IDs to the question components
 */
type QuestionsMapping = {
  [key: string]: QuestionComponent
}

/**
 * An easily rendered table row
 */
class TableRow {
  constructor(public components: QuestionComponent[]) {}
}

@Component({
  selector: 'app-question-table-view',
  templateUrl: './question-table-view.component.html',
  styleUrls: ['./question-table-view.component.css']
})
@ViewComponentRegistration(ComponentType.QUESTION_TABLE)
export class QuestionTableViewComponent extends AbstractComponentHost implements OnInit, QuestionViewComponent, QuestionComponentHost, OnChanges, OnDestroy {
  /**
   * The component being rendered by this view
   */
  @Input() component: ApplicationComponent;
  /**
   * The question table component cast from the passed in component
   */
  questionTable: QuestionTableComponent;
  /**
   * The form passed into the view component
   */
  @Input() form: FormGroup;
  /**
   * The group for this question. This will be the form passed into the sub-questions
   */
  group: FormGroup;
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
   * The matched host directives with the questions in the table
   */
  private matchedComponentHosts: MatchedComponentHosts;
  /**
   * The mapping of question IDs to their component instances
   */
  private matchedComponents: MatchedQuestionComponents;
  /**
   * A mapping of questions component IDs to the question components
   */
  private questionsMapping: QuestionsMapping = {};
  /**
   * The sub question values
   */
  private values: QuestionValues = {};
  /**
   * The list of column names
   */
  columnNames: string[] = [];
  /**
   * The rows in a format to make it easy to render
   */
  rows: TableRow[] = [];
  /**
   * A boolean flag to determine if the view has been initialised or not
   */
  private _viewInitialised: boolean = false;
  /**
   * The allowed types for the sub-questions
   */
  private readonly allowedQuestionTypes = [ComponentType.TEXT_QUESTION, ComponentType.SELECT_QUESTION, ComponentType.SIGNATURE];

  constructor(private readonly cd: ChangeDetectorRef,
    private loader: DynamicComponentLoader) { 
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
    this.questionTable = this.castComponent();
    this.addToForm();
    
    for (let key of Object.keys(this.questionTable.columns.columns)) {
      this.columnNames.push(key);
      const columns = this.questionTable.columns.columns[key];
      columns.components.forEach(component => this.questionsMapping[component.componentId] = component);
    }

    this.populateRows();
  }

  ngOnDestroy(): void {
    this.componentHosts.forEach(host => this.loader.destroyComponents(host.hostId));
  }

  private populateRows() {
    const columnsMapping = this.questionTable.columns.columns;

    if (Object.keys(columnsMapping).length > 0) {
      const numRows = columnsMapping[this.columnNames[0]].components.length;

      for (let i = 0; i < numRows; i++) {
        const row = new TableRow([]);
        this.rows.push(row);

        for (let column of this.columnNames) {
          row.components.push(columnsMapping[column].components[i]);
        }
      }
    }
  }

  viewInitialised(): boolean {
    return this._viewInitialised;
  }

  validComponent(componentType: ComponentType): boolean {
    return this.allowedQuestionTypes.indexOf(componentType) != -1;
  }

  loadComponents(): void {
    for (let key of Object.keys(this.questionsMapping)) {
      if (this.matchedComponents[key] == undefined) {
        // only load the component if it has not been loaded before
        const hostDirective = this.matchedComponentHosts[key];

        if (hostDirective == undefined) {
          throw new Error("No componentHost directive has been found with [hostId] set to the componentId of the question: " + key);
        }

        const questionComponent = this.questionsMapping[key];
        const type = questionComponent.getType();

        if (!this.validComponent(type)) {
          throw new Error(`The component type ${type} is not a supported question type in a QuestionTable`)
        } else {
          const questionChangeCallback = (e: QuestionChangeEvent) => this.onInput(e, key);
          this.matchedComponents[key] = this.loadComponent(this.loader, hostDirective, questionComponent, this.group, questionChangeCallback).instance as QuestionViewComponent;
        }
      }
    }

    this.detectChanges();
  }

  detectChanges(): void {
    this.cd.detectChanges();
  }

  private loadDirectives() {
    for (let hostDirective of this.componentHosts) {
      const componentId = hostDirective.hostId;

      for (let key of Object.keys(this.questionsMapping)) {
        if (componentId == key) {
          this.matchedComponentHosts[componentId] = hostDirective;
        }
      }
    }
  }

  ngAfterViewInit(): void {
    this._viewInitialised = true;
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

  addToForm(): void {
    if (!this.form.get(this.questionTable.componentId)) {
      this.form.addControl(this.questionTable.componentId, this.group);
    }
  }

  removeFromForm(): void {
    this.form.removeControl(this.questionTable.componentId);
  }
  
  castComponent() {
    return this.component as QuestionTableComponent;
  }

  value(): ValueType {
    const copiedValues = {};

    Object.keys(this.values).forEach(id => {
      const question = this.questionsMapping[id].componentId;
      const value = this.matchedComponents[question].value();

      copiedValues[question] = value;
    });

    return new ObjectValueType(copiedValues);
  }

  onInput(event: QuestionChangeEvent, question: string) {
    const value = event.value;
    this.values[question] = value;
    
    this.questionChange.emit(new QuestionChangeEvent(this.questionTable.componentId, this.value()));
  }
}
