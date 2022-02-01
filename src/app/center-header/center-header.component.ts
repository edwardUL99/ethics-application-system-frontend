import { Component, Input, OnInit } from '@angular/core';

/**
 * A component that displays a header centrally
 */
@Component({
  selector: 'app-center-header',
  templateUrl: './center-header.component.html',
  styleUrls: ['./center-header.component.css']
})
export class CenterHeaderComponent implements OnInit {
  /**
   * The header text
   */
  @Input() text: string;
  /**
   * The color of the header text
   */
  @Input() color: string = 'white';

  constructor() { }

  ngOnInit() {
  }

}
