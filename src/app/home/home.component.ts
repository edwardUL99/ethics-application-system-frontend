import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthorizationService } from '../users/authorization.service';
import { UserContext } from '../users/usercontext';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  /**
   * A variable to determine if the user can create applications
   */
  createApplication: boolean;
  /**
   * Determines if an error occurred
   */
  error: string;
  /**
   * The text for the header
   */
  headerText: string;
  /**
   * Name of committee contact
   */
  contactName: string = environment.contactName;
  /**
   * Email of committee contact
   */
  contactEmail: string = environment.contactEmail;

  constructor(private authorizationService: AuthorizationService,
    private userContext: UserContext,
    private router: Router) { 
    
    this.headerText = 'Science and Engineering Research Ethics Committee'
  }

  ngOnInit(): void {
    try {
      this.userContext.getUser().subscribe({
        next: user => {
          this.authorizationService.authorizeUserPermissions(user, ['CREATE_APPLICATION'], true).subscribe({
            next: create => this.createApplication = create,
            error: e => this.error = e
          });
        },
        error: e => this.error = e
      });
    } catch (e) {
      this.router.navigate(['logout'], {
        queryParams: {
          sessionTimeout: true,
          redirectUrl: '/home'
        }
      });
    }
  }

  goToApplications(create?: boolean) {
    const queryParams = {}

    if (create) {
      queryParams['create'] = 'true';
    }

    this.router.navigate(['applications'], {
      queryParams: queryParams
    });
  }
}
