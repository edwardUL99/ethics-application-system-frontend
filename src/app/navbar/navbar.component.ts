import { Component, OnInit, Input } from '@angular/core';

/**
 * This component represents a navbar used throughout the application
 */
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  /**
   * This should be set to true if you want to hide the nav links
   */
  @Input() hideLinks = false;
  /**
   * The name of the url to be active
   */
  @Input() active = '';
  /**
   * This determines if the navbar should be "sticky"
   */
  @Input() sticky = true;

  constructor() { }

  ngOnInit() {
  }

}
