import { Component, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Branch } from '../../../models/components/branch';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { Checkbox, CheckboxGroupComponent } from '../../../models/components/checkboxgroupcomponent';
import { QuestionChange, QuestionViewComponent, QuestionViewComponentShape, QuestionChangeEvent, ViewComponentShape } from '../application-view.component';
import { ActionBranch, Actions } from '../../../models/components/actionbranch';
import { ReplacementBranch } from '../../../models/components/replacementbranch';
import { ApplicationTemplateContext } from '../../../applicationtemplatecontext';
import { Application } from '../../../models/applications/application';
import { Answer, ValueType } from '../../../models/applications/answer';
import { QuestionViewUtils } from '../questionviewutils';
import { ComponentViewRegistration } from '../registered.components';
import { ApplicationTemplateDisplayComponent } from '../../application-template-display/application-template-display.component';
import { CheckboxGroupRequired } from '../../../../validators';
import { AlertComponent } from '../../../../alert/alert.component';
import { AutosaveContext } from '../autosave';

/**
 * A type for mapping checkbox names to the checkbox
 */
 export type CheckboxMapping = {
  [key: string]: Checkbox
};

/**
 * A map to determine if the checkbox component should be selected or not
 */
export type CheckboxSelection = {
  [key: string]: boolean
}

@Component({
  selector: 'app-checkbox-group-view',
  templateUrl: './checkbox-group-view.component.html',
  styleUrls: ['./checkbox-group-view.component.css']
})
@ComponentViewRegistration(ComponentType.CHECKBOX_GROUP)
export class CheckboxGroupViewComponent implements OnInit, QuestionViewComponent {
  /**
   * The component being rendered by this view
   */
  @Input() component: ApplicationComponent;
  /**
   * The parent component if it exists
   */
  @Input() parent: QuestionViewComponent;
  /**
   * The current application object
   */
  @Input() application: Application;
  /**
   * The template display component rendering this group
   */
  @Input() template: ApplicationTemplateDisplayComponent;
  /**
   * The form group passed into this component
   */
  form: FormGroup;
  /**
   * The checkboxes group
   */
  checkboxGroup: FormGroup;
  /**
   * The cast checkbox group compoennt
   */
  checkboxGroupComponent: CheckboxGroupComponent;
  /**
   * A mapping of checkboxes to the checkbox mapping ID
   */
  checkboxes: CheckboxMapping = {};
  /**
   * A map of values to determine if the selected checkboxes are checked
   */
  selectedCheckboxes: CheckboxSelection = {};
  /**
   * The question change event emitter
   */
  @Output() questionChange: QuestionChange = new QuestionChange();
  /**
   * Determines if the component is visible
   */
  @Input() visible: boolean;
  /**
   * An error message to display
   */
  @ViewChild('error')
  error: AlertComponent;
  /**
   * An alert for indicating information about the attach-file event
   */
  @ViewChild('attachFileAlert')
  attachFileAlert: AlertComponent;
  /**
   * The context for autosaving
   */
  autosaveContext: AutosaveContext;

  constructor() {}

  initialise(data: ViewComponentShape): void {
    const questionData = data as QuestionViewComponentShape;
    this.component = questionData.component;
    this.application = questionData.application;
    this.form = questionData.form;
    this.template = data.template;
    this.autosaveContext = questionData.autosaveContext;

    if (questionData.questionChangeCallback) {
      this.questionChange.register(questionData.questionChangeCallback);
    }
  }

  ngOnInit(): void {
    this.checkboxGroupComponent = this.castComponent();
    this.addToForm();

    QuestionViewUtils.setExistingAnswer(this, this.template?.viewingUser);
  }

  ngOnDestroy(): void {
    this.questionChange.destroy();
    this.removeFromForm();
  }

  addToForm(): void {
    const edit = this.edit();
    const newCheckboxGroup = !this.checkboxGroup;
    this.checkboxGroup = (!newCheckboxGroup) ? this.checkboxGroup:new FormGroup({});

    if (newCheckboxGroup) {
      this.checkboxGroupComponent.checkboxes.forEach(checkbox => {
        this.checkboxes[checkbox.identifier] = checkbox;
        this.selectedCheckboxes[checkbox.identifier] = false;
        this.checkboxGroup.addControl(checkbox.identifier, new FormControl({value: '', disabled: !edit}));
      });
    }

    if (edit && !this.form.get(this.checkboxGroupComponent.componentId)) {
      if (this.checkboxGroupComponent.required) {
        this.checkboxGroup.addValidators(CheckboxGroupRequired());
      }

      this.form.addControl(this.checkboxGroupComponent.componentId, this.checkboxGroup);
      this.autosaveContext?.registerQuestion(this);
    }
  }

  removeFromForm(): void {
    Object.keys(this.selectedCheckboxes).forEach(identifier => {
      this.selectedCheckboxes[identifier] = false;
    });

    this.form.removeControl(this.checkboxGroupComponent.componentId);
    this.checkboxGroup = undefined;
    this.autosaveContext?.removeQuestion(this);
  }

  /**
   * Uncheck all the checkboxes except the given one
   * @param checkbox the checkbox to except from unchecking
   */
  private uncheckAllExcept(checkbox: string) {
    Object.keys(this.selectedCheckboxes).forEach(identifier => {
      if (identifier != checkbox) {
       this.unselectCheckbox(identifier);
      }
    });
  }

  private unselectCheckbox(checkbox: string) {
    this.onCheckChange({target: {checked: false, value: checkbox}}, checkbox);
  }

  /**
   * Responds to a checkbox group selected
   * @param event the event
   * @param checkbox the identifier of the checkbox
   */
  onCheckChange(event, checkbox: string) {
    const defaultBranch = this.checkboxGroupComponent.defaultBranch;

    if (event.target.checked) {
      this.selectedCheckboxes[checkbox] = true;
      
      const thisCheckbox: Checkbox = this.checkboxes[checkbox];
      const branch = thisCheckbox.branch;

      if (!this.checkboxGroupComponent.multiple) {
        this.uncheckAllExcept(checkbox);
      }

      const control = this.checkboxGroup.get(checkbox);
      control.setValue(checkbox, {emitEvent: false});

      // execute the checked branch if it exists or else the default branch
      this.executeBranch((branch == null) ? defaultBranch : branch, checkbox);
    } else {
      this.selectedCheckboxes[checkbox] = false;
      this.checkboxGroup.get(checkbox).setValue('');
    }

    this.emit(true);
  }

  emit(autosave: boolean) {
    const e = new QuestionChangeEvent(this.component.componentId, this, autosave);
    this.questionChange.emit(e);
    this.autosaveContext?.notifyQuestionChange(e);
  }

  castComponent() {
    return this.component as CheckboxGroupComponent;
  }

  displayError(msg: string) {
    this.error.displayMessage(msg, true);
  }

  private _terminate(actionBranch: ActionBranch, checkbox: string) {
    let msg: string = 'Confirm application termination?';

    if (actionBranch.comment) {
      msg += ` Comment: ${actionBranch.comment}`
    }

    if (confirm(msg)) {
      this.template.terminateApplication(this);
    } else {
      this.unselectCheckbox(checkbox);
    }
  }

  private _attachFile() {
    this.attachFileAlert.alertType = 'alert-primary';
    this.attachFileAlert.message = 'Attaching file';
    this.attachFileAlert.show();
    this.template.attachFileToApplication(this);
  }

  private _executeActionBranch(branch: Branch, checkbox: string) {
    const actionBranch = branch as ActionBranch;
      
    if (actionBranch.action == Actions.TERMINATE) {
      this._terminate(actionBranch, checkbox);
    } else if (actionBranch.action == Actions.ATTACH_FILE) {
      this._attachFile();
    }
  }

  private _executeReplacement(branch: Branch, checkbox: string) {
    if (confirm('Are you sure you want to check this? It will change the application form you have to fill in and cannot be reversed')) {
      const replacementBranch = branch as ReplacementBranch;
      const templateContext = ApplicationTemplateContext.getInstance();

      for (let replacement of replacementBranch.replacements) {
        const replaced = templateContext.executeContainerReplacement(replacement.replace, replacement.target);
        this.template.loadNewContainer(replaced);
        // TODO maybe here, add functionality to swap back the old container if the checkbox is unchecked again. may need a mapping to indicate a container was swapped out
      }
    } else {
      this.unselectCheckbox(checkbox);
    }
  }

  /**
   * Executes a checkbox group branch
   * @param branch the branch to execute
   * @param checkbox the name of the checkbox
   */
  executeBranch(branch: Branch, checkbox: string) {
    if (branch != undefined && branch != null) {
      if (branch.type == ComponentType.ACTION_BRANCH) {
        this._executeActionBranch(branch, checkbox);
      } else if (branch.type == ComponentType.REPLACEMENT_BRANCH) {
        this._executeReplacement(branch, checkbox);
      }
    }
  }

  isChecked(checkbox: string): boolean {
    return this.selectedCheckboxes[checkbox];
  }

  edit(): boolean {
    return QuestionViewUtils.edit(this, true, this.template?.viewingUser);
  }

  display(): boolean {
    return QuestionViewUtils.display(this);
  }

  setFromAnswer(answer: Answer): void {
    if (answer.valueType != ValueType.OPTIONS) {
      throw new Error('Invalid answer type for the chekcbox group component');
    }

    answer.value.split(',').forEach(option => {
      const checkbox = (option.includes('=')) ? option.split('=')[0]:option;
      this.selectedCheckboxes[checkbox] = true;
      this.checkboxGroup.get(checkbox).setValue(true, {emitEvent: false});
    });

    this.checkboxGroup.markAsTouched();

    this.emit(false);
  }

  value(): Answer {
    const options = Object.keys(this.selectedCheckboxes)
      .filter(key => this.selectedCheckboxes[key]).join(',');

    return new Answer(undefined, this.component.componentId, options, ValueType.OPTIONS);
  }

  disableAutosave(): boolean {
    return true; // TODO for now don't autosave. This may not work for file attachments but think about it
  }

  isVisible(): boolean {
    return this.visible;
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
  }

  displayAnswer(): boolean {
    return true; // no-op
  }

  onFileAttached(message: string, error?: boolean) {
    // callback for when a file is attached after the attach-file action
    this.attachFileAlert.message = message;
    this.attachFileAlert.alertType = (error) ? 'alert-danger' : 'alert-success';
    this.attachFileAlert.show();

    if (!error) {
      setTimeout(() => this.attachFileAlert.hide(), 2000);
    }
  }
}