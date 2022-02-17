import { Component, OnInit } from '@angular/core';
import { ApplicationTemplateContext } from './applications/applicationtemplatecontext';
import { Application } from './applications/models/applications/application';
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
    const context = ApplicationTemplateContext.getInstance();
    context.addTemplate(template);
    context.setCurrentTemplate(template.id);
  }

  ngOnInit(): void {}
}
