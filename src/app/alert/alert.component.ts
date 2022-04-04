import { Component, Input, OnInit } from '@angular/core';

/**
 * This component represents a dismissable alert
 */
@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {
  /**
   * The type of the alert
   */
  @Input() alertType: string = 'alert-info';
  /**
   * The message
   */
  @Input() message: string = '';
  /**
   * Determines if the alert can be dismissed
   */
  @Input() dismissible: boolean = false;
  /**
   * A flag to indicate that the alert should be hidden
   */
  @Input() hidden: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  /**
   * Show the alert
   */
  show() {
    this.hidden = false;
  }

  /**
   * Hide the alert
   */
  hide()  {
    this.hidden = true;
  }

  /**
   * A utility function to display the given success message and hide it after 2000 ms.
   * If error, it will not be hidden automatically
   */
  displayMessage(message: string, error?: boolean, hide: boolean = true) {
    this.message = message;
    this.alertType = (error) ? 'alert-danger' : 'alert-success';
    this.show();

    if (!error && this.dismissible && hide) {
      setTimeout(() => this.hide(), 2000);
    }
  }
}
