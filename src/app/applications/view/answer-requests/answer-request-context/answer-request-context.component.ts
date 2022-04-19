import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ViewingUser } from '../../../applicationcontext';
import { Application } from '../../../models/applications/application';
import { QuestionComponent } from '../../../models/components/questioncomponent';
import { AbstractComponentHost } from '../../component/abstractcomponenthost';
import { QuestionChange, QuestionChangeEvent, QuestionViewComponent, QuestionViewComponentShape } from '../../component/application-view.component';
import { ComponentHost } from '../../component/component-host.directive';
import { ComponentDisplayContext } from '../../component/displaycontext';
import { DynamicComponentLoader } from '../../component/dynamiccomponents';
import { RequestedAnswers } from '../requestedanswers';

/**
 * This component provides a separate context display component for rendering individual components.
 * It provides a simple context and does not support autosave, file attachments or termination of applications etc.
 */
@Component({
  selector: 'app-answer-request-context',
  templateUrl: './answer-request-context.component.html',
  styleUrls: ['./answer-request-context.component.css']
})
export class AnswerRequestContextComponent extends AbstractComponentHost implements OnInit, ComponentHost, AfterViewInit, OnDestroy, ComponentDisplayContext {
  /**
   * The application being referenced
   */
  @Input() application: Application;
  /**
   * The component being answered
   */
  @Input() component: QuestionComponent;
  /**
   * The user viewing the context
   */
  @Input() viewingUser: ViewingUser;
  /**
   * The emitter to propagate answer changes
   */
  @Output() questionChange: QuestionChange = new QuestionChange();
  /**
   * A variable to indicate if the view is initialised or not
   */ 
  private _viewInitialised: boolean = false;
  /**
   * The form to pass into the component. Should be passed in by the parent component
   */
  @Input() form: FormGroup;

  constructor(private cd: ChangeDetectorRef, private loader: DynamicComponentLoader) {
    super();
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this._viewInitialised = true;
    this.loadComponents();
  }

  ngOnDestroy(): void {
    this.questionChange.destroy();
    this.loader.destroyComponents(this.component.componentId);
  }

  viewInitialised(): boolean {
    return this._viewInitialised;
  }

  loadComponents(): void {
    if (this._viewInitialised && this.application) {
    const callback = (e: QuestionChangeEvent) => this.propagateQuestionChange(this.questionChange, e);

    const data: QuestionViewComponentShape = {
      application: this.application,
      form: this.form,
      questionChangeCallback: callback,
      component: this.component,
      context: this,
      autosaveContext: undefined
    };

      this.loadComponent(this.loader, this.component?.componentId, undefined, data);
    }

    this.form.updateValueAndValidity();
    this.detectChanges();
  }

  propagateQuestionChange(questionChange: QuestionChange, e: QuestionChangeEvent): void {
    questionChange.emit(e);
  }

  attachFileToApplication(): void {
    // no-op in this context
  }

  terminateApplication(): void {
    // no-op in this context
  }

  detectChanges(): void {
    this.cd.detectChanges();
  }

  loadNewContainer(): void {
    // no-op in this context
  }

  onAnswerRequested(): void {
    // no-op here since the answer requested is being answered
  }

  answerRequestEnabled(): boolean {
    return false; // this context is used to answer the request, not to create new ones
  }

  allowAnswerEdit(): boolean {
    return true;
  }

  getRequestedAnswers(): RequestedAnswers {
    // no-op in this context
    return undefined;
  }

  displayComponent(component: QuestionViewComponent): boolean {
    // no-op in this context
    return true;
  }

  displayAndDisableComponent(component: QuestionViewComponent): boolean {
    // no-op in this context
    return false;
  }
}
