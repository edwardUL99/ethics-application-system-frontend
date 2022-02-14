import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ApplicationTemplateContext } from '../../applicationtemplatecontext';
import { ApplicationTemplate } from '../../models/applicationtemplate';
import { ComponentType } from '../../models/components/applicationcomponent';
import { AbstractComponentHost } from '../component/abstractcomponenthost';
import { QuestionChange, QuestionChangeEvent } from '../component/application-view.component';
import { ComponentHost } from '../component/component-host.directive';
import { DynamicComponentLoader } from '../component/dynamiccomponents';
import { SectionViewComponentShape } from '../component/section-view/section-view.component';
import { AutofillResolver, setResolver } from '../../autofill/resolver';

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
  template: ApplicationTemplate;
  /**
   * The form group instance to pass to the child components
   */
  form: FormGroup;
  /**
   * The output to propagate question changes up
   */
  @Output() questionChange: QuestionChange = new QuestionChange();
  /**
   * Event for when the submit button is clicked
   */
  @Output() submitEvent: EventEmitter<any> = new EventEmitter();
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
    this.loader.destroyComponents();
    setResolver(undefined); // clean up and remove the set autofill resolver
  }

  viewInitialised(): boolean {
    return this._viewInitialised;
  }

  propagateQuestionChange(questionChange: QuestionChange, e: QuestionChangeEvent) {
    questionChange.emit(e);
    console.log('Question change from child component ' + e.id + ' detected');
  }

  loadComponents(): void {
    if (this._viewInitialised) {
      const callback = (e: QuestionChangeEvent) => this.propagateQuestionChange(this.questionChange, e);

      for (let component of this.template.components) {
        if (component.getType() == ComponentType.SECTION) {
          const data: SectionViewComponentShape = {
            component: component,
            form: this.form,
            subSection: false,
            questionChangeCallback: callback
          };

          this.loadComponentSubSection(this.loader, '', data);
        } else {
          this.loadComponent(this.loader, '', component, this.form, callback);
        }
      }
    }

    this.detectChanges()
  }

  detectChanges(): void {
    this.cd.detectChanges();
  }

  onSubmit() {
    // TODO emit proper event here and determine the type of what is emitted
    console.log('Emitting submit event');
    this.submitEvent.emit();
  }
}
