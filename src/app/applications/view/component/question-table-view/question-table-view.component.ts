import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { QuestionComponent } from '../../../models/components/questioncomponent';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { QuestionTableComponent } from '../../../models/components/questiontablecomponent';
import { AbstractComponentHost } from '../abstractcomponenthost';
import { QuestionChange, QuestionChangeEvent, QuestionViewComponent, QuestionViewComponentShape, ViewComponentShape } from '../application-view.component';
import {  MatchedQuestionComponents, QuestionComponentHost } from '../component-host.directive';
import { ObjectValueType, ValueType, ValueTypes } from '../valuetype';
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

// static call to have a reference to 'this' in a callback
function onInputStatic(component: QuestionTableViewComponent, event: QuestionChangeEvent, question: string) {
  component.onInput(event, question);
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
   * The question change event emitter
   */
  @Output() questionChange: QuestionChange = new QuestionChange();
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
    Object.keys(this.questionsMapping).forEach(key => this.loader.destroyComponents(key));
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
    const thisInstance = this; // capture the instance of this to pass into callback

    for (let key of Object.keys(this.questionsMapping)) {
      if (this.matchedComponents[key] == undefined) {
        // only load the component if it has not been loaded before
        const questionComponent = this.questionsMapping[key];
        const type = questionComponent.getType();

        if (!this.validComponent(type)) {
          throw new Error(`The component type ${type} is not a supported question type in a QuestionTable`)
        } else {
          const questionChangeCallback = (e: QuestionChangeEvent) => onInputStatic(thisInstance, e, key);
          this.matchedComponents[key] = this.loadComponent(this.loader, key, questionComponent, this.group, questionChangeCallback).instance as QuestionViewComponent;
        }
      }
    }

    this.detectChanges();
  }

  detectChanges(): void {
    this.cd.detectChanges();
  }

  ngAfterViewInit(): void {
    this._viewInitialised = true;
  }

  ngOnChanges(): void {
    if (this._viewInitialised) {
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

  setValue(componentId: string, value: ValueType): boolean {
    if (componentId in this.matchedComponents) {
      this.onInput(new QuestionChangeEvent(componentId, value), componentId, false);
      return this.matchedComponents[componentId].setValue(componentId, value);
    }

    return false;
  }

  propagateQuestionChange(questionChange: QuestionChange, e: QuestionChangeEvent) {
    // TODO no-op for now, may be needed
  }

  onInput(event: QuestionChangeEvent, question: string, emitEvent: boolean = true) {
    const value = event.value;
    this.values[question] = value;
    
    if (emitEvent) {
      this.questionChange.emit(new QuestionChangeEvent(this.questionTable.componentId, this.value()));
    }
  }
}
