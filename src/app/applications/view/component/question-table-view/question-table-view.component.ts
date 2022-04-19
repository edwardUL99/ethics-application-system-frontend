import { ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { QuestionComponent } from '../../../models/components/questioncomponent';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { QuestionTableComponent } from '../../../models/components/questiontablecomponent';
import { AbstractComponentHost } from '../abstractcomponenthost';
import { QuestionChange, QuestionChangeEvent, QuestionViewComponent, QuestionViewComponentShape, ViewComponentShape } from '../application-view.component';
import { MatchedQuestionComponents, QuestionComponentHost } from '../component-host.directive';
import { ComponentViewRegistration } from '../registered.components';
import { DynamicComponentLoader } from '../dynamiccomponents';
import { Application } from '../../../models/applications/application';
import { Answer } from '../../../models/applications/answer';
import { QuestionViewUtils } from '../questionviewutils';
import { AutosaveContext } from '../autosave';
import { ComponentDisplayContext } from '../displaycontext';
import { resolveStatus } from '../../../models/requests/mapping/applicationmapper';

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
  component.onInput();
}

@Component({
  selector: 'app-question-table-view',
  templateUrl: './question-table-view.component.html',
  styleUrls: ['./question-table-view.component.css']
})
@ComponentViewRegistration(ComponentType.QUESTION_TABLE)
export class QuestionTableViewComponent extends AbstractComponentHost implements OnInit, QuestionViewComponent, QuestionComponentHost, OnDestroy {
  /**
   * The component being rendered by this view
   */
  @Input() component: ApplicationComponent;
  /**
   * The parent component if it exists
   */
  @Input() parent: QuestionViewComponent;
  /**
   * The question table component cast from the passed in component
   */
  questionTable: QuestionTableComponent;
  /**
   * The current application object
   */
  @Input() application: Application;
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
  private matchedComponents: MatchedQuestionComponents = {};
  /**
   * A mapping of questions component IDs to the question components
   */
  private questionsMapping: QuestionsMapping = {};
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
  /**
   * Determines if the component is visible
   */
  @Input() visible: boolean = true;
  /**
   * Autosave context
   */
  autosaveContext: AutosaveContext;
  /**
   * The display context the view component is being rendered inside
   */
  @Input() context: ComponentDisplayContext;
  /**
   * The underlying table element
   */
  @ViewChild('table')
  table: ElementRef;
  /**
   * Rather than displaying an empty cell on no answer, display the placeholder
   */
  readonly displayAnswerPlaceholder?: boolean = true;

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
    
    for (let key of Object.keys(this.questionTable.cells.columns)) {
      this.columnNames.push(key);
      const columns = this.questionTable.cells.columns[key];
      columns.components.forEach(component => this.questionsMapping[component.componentId] = component);
    }

    this.populateRows();
  }

  ngOnDestroy(): void {
    this.questionChange.destroy();
    Object.keys(this.questionsMapping).forEach(key => this.loader.destroyComponents(key));
    this.removeFromForm();
  }

  private populateRows() {
    const columnsMapping = this.questionTable.cells.columns;

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
    const refs = [];
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
          const data: QuestionViewComponentShape = {
            component: questionComponent,
            application: this.application,
            form: this.group,
            parent: this,
            questionChangeCallback: questionChangeCallback,
            autosaveContext: this.autosaveContext,
            context: this.context,
            hideComments: true // let the question table manage comments for all its cells, rather than the individual cells
          };

          const ref = this.loadComponent(this.loader, key, this.context.autofillNotifier, data, true);
          refs.push(ref);
          this.matchedComponents[key] = ref.instance as QuestionViewComponent;
        }
      }
    }

    refs.forEach(ref => ref.changeDetectorRef.detectChanges());
    this.detectChanges();
  }

  detectChanges(): void {
    this.cd.detectChanges();
  }

  ngAfterViewInit(): void {
    this._viewInitialised = true;
    this.loadComponents();
  }

  addToForm(): void {
    this.questionTable = this.castComponent();

    if (!this.form.get(this.questionTable.componentId)) {
      this.form.addControl(this.questionTable.componentId, this.group);
    }
  }

  removeFromForm(): void {
    if (this.questionTable) {
      this.form.removeControl(this.questionTable.componentId);
    }
  }

  questionName(): string {
    return this.questionTable.componentId;
  }
  
  castComponent() {
    return this.component as QuestionTableComponent;
  }

  propagateQuestionChange(questionChange: QuestionChange, e: QuestionChangeEvent) {
    // no-op
  }

  onInput(emitEvent: boolean = true) {    
    if (emitEvent) {
      this.emit(true);
    }
  }

  emit(autosave: boolean, emitChange: boolean = true): void {
    const e = new QuestionChangeEvent(this.component.componentId, this, autosave);
    
    if (emitChange)
      this.questionChange.emit(e);
  }

  display(): boolean {
    return true; // no-op
  }

  edit(): boolean {
    return false;
  }

  setFromAnswer(answer: Answer): void {
    if (answer.componentId in this.matchedComponents) {
      this.matchedComponents[answer.componentId].setFromAnswer(answer);
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

  maxWidth(): number {
    if (this.table) {
      return this.table.nativeElement.offsetWidth / this.columnNames.length;
    } else {
      return -1;
    }
  }

  markRequired(): void {
    // no-op
  }
}
