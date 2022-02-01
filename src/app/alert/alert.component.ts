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

  constructor() { }

  ngOnInit() {
  }

}
