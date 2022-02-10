import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Branch } from '../../../models/components/branch';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { Checkbox, CheckboxGroupComponent } from '../../../models/components/checkboxgroupcomponent';
import { QuestionViewComponent, QuestionViewComponentShape, QuestionViewEvent, ViewComponentShape } from '../application-view.component';
import { ActionBranch } from '../../../models/components/actionbranch';
import { ReplacementBranch } from '../../../models/components/replacementbranch';
import { ApplicationTemplateContext } from '../../../applicationtemplatecontext';
import { ObjectValueType, ValueType } from '../valuetype';

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
export class CheckboxGroupViewComponent implements OnInit, QuestionViewComponent {
  /**
   * The component being rendered by this view
   */
  @Input() component: ApplicationComponent;
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
  private controlsMapping: Object = {};
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
  @Output() questionChange: EventEmitter<QuestionViewEvent>;

  constructor() { }

  initialise(data: ViewComponentShape): void {
    const questionData = data as QuestionViewComponentShape;
    this.component = questionData.component;
    this.form = questionData.form;
  }

  ngOnInit(): void {
    this.checkboxGroupComponent = this.castComponent();
    this.addToForm();
    this.checkboxGroupComponent.checkboxes.forEach(checkbox => {
      this.checkboxes[checkbox.name] = checkbox;
      this.selectedCheckboxes[checkbox.name] = false;
    });
  }

  addToForm(): void {
    if (!this.form.get(this.checkboxGroupComponent.componentId)) {
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
    Object.keys(this.selectedCheckboxes).forEach(title => {
      if (title != checkbox) {
        this.selectedCheckboxes[title] = false;
        delete this.controlsMapping[checkbox];
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

      this.checkboxArray.push(new FormControl(event.target.value));

      // execute the checked branch if it exists or else the default branch
      this.executeBranch((branch == null) ? defaultBranch : branch);
    } else {
      let i = 0;
      
      this.selectedCheckboxes[checkbox] = false;
      this.checkboxArray.controls.forEach(control => {
        if (control.value == event.target.value) {
          delete this.controlsMapping[checkbox];
          this.checkboxArray.removeAt(i);
          return;
        }

        i++;
      });
    }

    this.questionChange.emit(new QuestionViewEvent(this.component.componentId, this.value()));
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

  value(): ValueType {
    const value = {}

    Object.keys(this.controlsMapping).forEach(key => {
      value[key] = this.controlsMapping[key].value;
    })

    return new ObjectValueType(value);
  }
}
