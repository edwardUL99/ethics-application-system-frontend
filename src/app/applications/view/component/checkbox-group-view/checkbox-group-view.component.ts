import { Component, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Branch } from '../../../models/components/branch';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { Checkbox, CheckboxGroupComponent } from '../../../models/components/checkboxgroupcomponent';
import { QuestionChange, QuestionViewComponent, QuestionViewComponentShape, QuestionChangeEvent, ViewComponentShape } from '../application-view.component';
import { ActionBranch } from '../../../models/components/actionbranch';
import { ReplacementBranch } from '../../../models/components/replacementbranch';
import { ApplicationTemplateContext } from '../../../applicationtemplatecontext';
import { Application } from '../../../models/applications/application';
import { Answer, ValueType } from '../../../models/applications/answer';
import { QuestionViewUtils } from '../questionviewutils';
import { ViewComponentRegistration } from '../registered.components';

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

/**
 * A mapping of a key to a form control
 */
export type ControlsMapping = {
  [key: string]: FormControl;
}

@Component({
  selector: 'app-checkbox-group-view',
  templateUrl: './checkbox-group-view.component.html',
  styleUrls: ['./checkbox-group-view.component.css']
})
@ViewComponentRegistration(ComponentType.CHECKBOX_GROUP)
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
   * The form group passed into this component
   */
  form: FormGroup;
  /**
   * The array of checkboxes
   */
  checkboxArray: FormArray;
  /**
   * The mapping of checkbox name to controls
   */
  private controlsMapping: ControlsMapping = {};
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

  constructor() {}

  initialise(data: ViewComponentShape): void {
    const questionData = data as QuestionViewComponentShape;
    this.component = questionData.component;
    this.application = questionData.application;
    this.form = questionData.form;

    if (questionData.questionChangeCallback) {
      this.questionChange.register(questionData.questionChangeCallback);
    }
  }

  ngOnInit(): void {
    this.checkboxGroupComponent = this.castComponent();
    this.addToForm();
    const edit = this.edit();
    this.checkboxGroupComponent.checkboxes.forEach(checkbox => {
      this.checkboxes[checkbox.identifier] = checkbox;
      this.selectedCheckboxes[checkbox.identifier] = false;
      this.controlsMapping[checkbox.identifier] = new FormControl({value: '', disabled: !edit});
    });

    QuestionViewUtils.setExistingAnswer(this);
  }

  ngOnDestroy(): void {
    this.questionChange.destroy();
  }

  addToForm(): void {
    if (this.edit() && !this.form.get(this.checkboxGroupComponent.componentId)) {
      this.checkboxArray = (this.checkboxArray) ? this.checkboxArray:new FormArray([]);
      this.form.addControl(this.checkboxGroupComponent.componentId, this.checkboxArray);
    }
  }

  removeFromForm(): void {
    this.form.removeControl(this.checkboxGroupComponent.componentId);
  }

  /**
   * Uncheck all the checkboxes except the given one
   * @param checkbox the checkbox to except from unchecking
   */
  private uncheckAllExcept(checkbox: string) {
    Object.keys(this.selectedCheckboxes).forEach(identifier => {
      if (identifier != checkbox) {
        this.selectedCheckboxes[identifier] = false;
      }
    })
  }

  /**
   * Responds to a checkbox group selected
   * @param event the event
   * @param checkboxId the title of the checkbox
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

      const control = this.controlsMapping[checkbox];
      control.setValue(checkbox, {emitEvent: false});
      this.checkboxArray.push(control);

      // execute the checked branch if it exists or else the default branch
      this.executeBranch((branch == null) ? defaultBranch : branch);
    } else {
      let i = 0;
      
      this.selectedCheckboxes[checkbox] = false;
      this.checkboxArray.controls.forEach(control => {
        if (control.value == event.target.value) {
          control.setValue('', {emitEvent: false});
          this.checkboxArray.removeAt(i);
          return;
        }

        i++;
      });
    }

    this._emit();
  }

  private _emit() {
    this.questionChange.emit(new QuestionChangeEvent(this.component.componentId, this));
  }

  castComponent() {
    return this.component as CheckboxGroupComponent;
  }

  /**
   * Executes a checkbox group branch
   * @param branch the branch to execute
   */
  executeBranch(branch: Branch) {
    if (branch.type == ComponentType.ACTION_BRANCH) {
      const actionBranch = branch as ActionBranch;
      console.log(actionBranch);

      // TODO here, execute the action in some way and remove console log
    } else if (branch.type == ComponentType.REPLACEMENT_BRANCH) {
      const replacementBranch = branch as ReplacementBranch;
      const templateContext = ApplicationTemplateContext.getInstance();

      for (let replacement of replacementBranch.replacements) {
        templateContext.executeContainerReplacement(replacement.replaceId, replacement.targetId);
        // TODO maybe here, add functionality to swap back the old container if the checkbox is unchecked again. may need a mapping to indicate a container was swapped out
      }
    }
  }

  edit(): boolean {
    return QuestionViewUtils.edit(this);
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
      this.controlsMapping[checkbox].setValue(true.valueOf, {emitEvent: false});
    });

    this.checkboxArray.markAsTouched();

    this._emit();
  }

  value(): Answer {
    const options = Object.keys(this.selectedCheckboxes)
      .filter(key => this.selectedCheckboxes[key]).join(',');

    return new Answer(undefined, this.component.componentId, options, ValueType.OPTIONS);
  }

  disableAutosave(): boolean {
    return true; // TODO for now don't autosave. This may not work for file attachments but think about it
  }
}
