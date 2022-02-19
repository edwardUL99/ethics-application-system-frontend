import { Component, OnInit } from '@angular/core';
import { ApplicationTemplateContext } from './applications/applicationtemplatecontext';
import { Application } from './applications/models/applications/application';
import { ContainerComponent } from './applications/models/components/containercomponent';
import { RadioQuestionComponent } from './applications/models/components/radioquestioncomponent';
import { SectionComponent } from './applications/models/components/sectioncomponent';
import { Option } from './applications/models/components/selectquestioncomponent';
import { createApplicationTemplateWithContainer, createDraftApplication } from './testing/fakes';

/**
 * TODO remove this code after testing but test that the new component host framework works with more complex nested components like a multipart question
 */

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  application: Application;

  constructor() {
    this.application = createDraftApplication(); // TODO this is for testing, remove when finished testing
    const template = createApplicationTemplateWithContainer();
    
    const radio: RadioQuestionComponent = new RadioQuestionComponent(5, 'Test Radio', 'radio-component-id',
    'This is a radio used for testing', 'radio', true, [], false);
    radio.options.push(new Option(10, 'Radio 1', 'radio1', 'identifier1'));
    radio.options.push(new Option(11, 'Radio 2', 'radio2', 'identifier2'));
    ((template.components[0] as SectionComponent).components[0] as ContainerComponent).components.push(radio);

    const context = ApplicationTemplateContext.getInstance();
    context.addTemplate(template);
    context.setCurrentTemplate(template.id);
  }

  ngOnInit(): void {}
}
