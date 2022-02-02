import { Component, OnInit, Input } from '@angular/core';

/**
 * This component represents an error message to display beneath a field
 */
@Component({
  selector: 'app-field-error',
  templateUrl: './field-error.component.html',
  styleUrls: ['./field-error.component.css']
})
export class FieldErrorComponent implements OnInit {
  /**
   * The condition to display it on
   */
  @Input() condition: boolean;
  /**
   * The error message
   */
  @Input() error: string;

  constructor() { }

  ngOnInit(): void {
  }

}
