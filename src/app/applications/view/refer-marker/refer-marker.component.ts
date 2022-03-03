import { Component, Input, OnInit } from '@angular/core';
import { ViewingUser } from '../../applicationcontext';
import { Application } from '../../models/applications/application';
import { ApplicationStatus } from '../../models/applications/applicationstatus';
import { ApplicationComponent } from '../../models/components/applicationcomponent';

@Component({
  selector: 'app-refer-marker',
  templateUrl: './refer-marker.component.html',
  styleUrls: ['./refer-marker.component.css']
})
export class ReferMarkerComponent implements OnInit {
  /**
   * The application to add the component to
   */
  @Input() application: Application;
  /**
   * The application component the marker is attached to
   */
  @Input() component: ApplicationComponent;
  /**
   * The user viewing the application
   */
  @Input() viewingUser: ViewingUser;
  /**
   * Determine if the marker should be displayed or not
   */
  display: boolean;

  constructor() { }

  ngOnInit(): void {
    this.display = this.viewingUser?.admin && 
      [ApplicationStatus.SUBMITTED, ApplicationStatus.REVIEW, ApplicationStatus.REVIEWED].indexOf(this.application.status) != -1;
  }

  /**
   * Take the input from the checkbox
   * @param event the event from the chekbox
   */
  onChange(event: any) {
    if (event.target.checked) {
      this.application.editableFields.push(this.component.componentId);
    } else {
      const index = this.application.editableFields.indexOf(this.component.componentId);

      if (index > -1) {
        this.application.editableFields.splice(index, 1);
      }
    }
  }
}
