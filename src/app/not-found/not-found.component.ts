import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit {
  currentURL: string = '';
  /**
  * Email of committee contact
  */
  contactEmail: string = environment.contactEmail;

  constructor(private router: Router) { 
    this.router.events.subscribe(() => this.changeURL());
  }

  ngOnInit() {
    this.changeURL();
  }

  private changeURL() {
    this.currentURL = this.router.url;
  }
}
