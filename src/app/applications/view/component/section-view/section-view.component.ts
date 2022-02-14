import { Component, Input, OnInit, OnChanges, ChangeDetectorRef, OnDestroy, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SectionComponent } from '../../../models/components/sectioncomponent';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { ApplicationViewComponent, QuestionChange, QuestionChangeEvent, QuestionViewComponentShape, ViewComponentShape } from '../application-view.component';
import { ComponentHost } from '../component-host.directive';
import { ViewComponentRegistration } from '../registered.components';
import { AbstractComponentHost } from '../abstractcomponenthost';
import { DynamicComponentLoader } from '../dynamiccomponents';
import { ValueType } from '../valuetype';

export interface SectionViewComponentShape extends QuestionViewComponentShape {
  /**
   * Determines if the section is a sub-section of another section. If so it is not displayed in another card
   */
  subSection?: boolean;
}

@Component({
  selector: 'app-section-view',
  templateUrl: './section-view.component.html',
  styleUrls: ['./section-view.component.css']
})
@ViewComponentRegistration(ComponentType.SECTION)
export class SectionViewComponent extends AbstractComponentHost implements OnInit, OnChanges, ApplicationViewComponent, ComponentHost, OnDestroy {
  /**
   * The component to be displayed
   */
  @Input() component: ApplicationComponent; // TODO need to have an event for if auto save is true
  /**
   * The optional form parameter if the child components require it
   */
  @Input() form: FormGroup;
  /**
   * The question change to propagate changes
   */
  @Output() questionChange: QuestionChange = new QuestionChange();
  /**
   * Determines if the section is a sub-section of another section. If so it is not displayed in another card
   */
  subSection: boolean = false;
  /**
   * The css class for the section
   */
  sectionClass: string;
  /**
   * The flag to track if the view is initialised
   */
  private _viewInitialised: boolean = false;

  constructor(private readonly cd: ChangeDetectorRef,
    private loader: DynamicComponentLoader) {
    super();
  }

  initialise(data: ViewComponentShape): void {
    const questionData = data as SectionViewComponentShape;
    this.component = questionData.component;
    this.form = questionData.form;
    this.subSection = questionData.subSection;
    this.sectionClass = (!this.subSection) ? 'card my-4 pl-2 pr-2':'m';
  
    if (questionData.questionChangeCallback) {
      this.questionChange.register(questionData.questionChangeCallback);
    }
  }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    this.loadComponents();
  }

  ngOnDestroy(): void {
    this.loader.destroyComponents(this.component.componentId);
  }

  ngAfterViewInit(): void {
    this._viewInitialised = true;
    this.loadComponents();
  }

  viewInitialised(): boolean {
    return this._viewInitialised;
  }

  loadComponents() {
    if (this.component && this.viewInitialised()) {
      const callback = (e: QuestionChangeEvent) => this.propagateQuestionChange(this.questionChange, e);
      const castedComponent = this.castComponent();
      
      castedComponent.components.forEach(component => {
        if (component.getType() == ComponentType.SECTION) {
          this.loadComponentSubSection(this.loader, this.component.componentId, {component: component, form: this.form, subSection: true, questionChangeCallback: callback}); // section is being loaded inside in a section, so, it is a sub-section
        } else {
          this.loadComponent(this.loader, this.component.componentId, component, this.form, callback);
        }
      });
    }

    this.detectChanges();
  }

  castComponent() {
    return this.component as SectionComponent;
  }

  detectChanges(): void {
    this.cd.detectChanges();
  }

  propagateQuestionChange(questionChange: QuestionChange, e: QuestionChangeEvent) {
    questionChange.emit(e);
  }

  setValue(componentId: string, value: ValueType): boolean {
    for (let component of this.loader.getLoadedComponents(this.component.componentId)) {
      if (component.setValue(componentId, value)) {
        return true;
      }
    }

    return false;
  }

  // TODO implement the other component views (think it's only QuestionTable left). Implement the view for viewing an application template also which has an element marked as componentHost and load components like this
  // TODO Also implement application models like the application class and request/response classes. Then have an ApplicationContext class that holds the application being worked on. This context class can be made an attribute of the ApplicationViewComponent interface since to render (and perform actions) on the rendered components (such as save sections, answers etc.) you need the application context which may also hold the application service reference etc.
}
