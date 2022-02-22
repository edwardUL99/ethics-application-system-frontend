import { Component, Input, OnInit } from '@angular/core';
import { ApplicationComponent, ComponentType } from '../../../models/components/applicationcomponent';
import { TextComponent } from '../../../models/components/textcomponent';
import { ApplicationViewComponent, ViewComponentShape } from '../application-view.component';
import { ViewComponentRegistration } from '../registered.components';

@Component({
  selector: 'app-text-view',
  templateUrl: './text-view.component.html',
  styleUrls: ['./text-view.component.css']
})
@ViewComponentRegistration(ComponentType.TEXT)
export class TextViewComponent implements OnInit, ApplicationViewComponent {
  /**
   * The component this view is rendering
   */
  @Input() component: ApplicationComponent;

  constructor() { }

  ngOnInit(): void {
  }

  initialise(data: ViewComponentShape): void {
    this.component = data.component;
  }

  castComponent() {
    return this.component as TextComponent;
  }

  ngOnDestroy(): void {}
}
