import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ContainerComponent } from './applications/models/components/containercomponent';
import { SectionComponent } from './applications/models/components/sectioncomponent';
import { TextQuestionComponent } from './applications/models/components/textquestioncomponent';
import { AbstractComponentHost } from './applications/view/component/abstractcomponenthost';
import { ComponentHost, ComponentHostDirective } from './applications/view/component/component-host.directive';
import { DynamicComponentLoader } from './applications/view/component/dynamiccomponents';

/**
 * TODO remove this code after testing but test that the new component host framework works with more complex nested components like a multipart question
 */

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent extends AbstractComponentHost implements ComponentHost, OnInit, AfterViewInit {
  title = 'app';
  component: SectionComponent;
  @ViewChild(ComponentHostDirective)
  componentHost?: ComponentHostDirective;
  form: FormGroup;

  constructor(private cd: ChangeDetectorRef, private loader: DynamicComponentLoader) {
    super()
  }

  loadComponents(): void {
    this.loadComponent(this.loader, '', this.component, this.form);
    this.detectChanges();
  }

  viewInitialised(): boolean {
    return true;
  }

  ngAfterViewInit(): void {
    this.loadComponents();
  }

  ngOnInit(): void {
    const section = new SectionComponent(2, 'section', 'component-id', 'description', [], true);
    const container = new ContainerComponent(3, 'component-container', 'test-container', []);
    container.components.push(new TextQuestionComponent(4, 'test question', 'component-id2', 'test description question', 'test name', true, true, 'text'))
    section.components.push(container);

    this.component = section;
    this.form = new FormGroup({});
  }

  detectChanges(): void {
    this.cd.detectChanges();
  }
}
