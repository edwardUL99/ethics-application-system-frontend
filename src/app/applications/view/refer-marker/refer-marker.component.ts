import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ViewingUser } from '../../applicationcontext';
import { Application } from '../../models/applications/application';
import { ApplicationStatus } from '../../models/applications/applicationstatus';
import { resolveStatus } from '../../models/requests/mapping/applicationmapper';
import { ApplicationViewComponent } from '../component/application-view.component';

@Component({
  selector: 'app-refer-marker',
  templateUrl: './refer-marker.component.html',
  styleUrls: ['./refer-marker.component.css']
})
export class ReferMarkerComponent implements OnInit, OnChanges {
  /**
   * The application to add the component to
   */
  @Input() application: Application;
  /**
   * The application component the marker is attached to
   */
  @Input() component: ApplicationViewComponent;
  /**
   * The user viewing the application
   */
  @Input() viewingUser: ViewingUser;
  /**
   * Determine if the component should be enabled
   */
  @Input() enable: boolean;
  /**
   * Determine if the marker should be displayed or not
   */
  display: boolean;

  constructor() { }

  ngOnInit(): void {}

  ngOnChanges() {
    this.display = this.viewingUser?.admin &&
      this.enable &&
      ApplicationStatus.REVIEWED == resolveStatus(this.application.status);
  }

  /**
   * Take the input from the checkbox
   * @param event the event from the chekbox
   */
  onChange(event: any) {
    if (!this.application.editableFields) {
      this.application.editableFields = [];
    }

    if (event.target.checked) {
      this.application.editableFields.push(this.component.component.componentId);
    } else {
      const index = this.application.editableFields.indexOf(this.component.component.componentId);

      if (index > -1) {
        this.application.editableFields.splice(index, 1);
      }
    }
  }
}
