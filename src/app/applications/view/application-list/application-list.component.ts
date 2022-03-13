import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserContext } from '../../../users/usercontext';
import { AuthorizationService } from '../../../users/authorization.service';
import { ApplicationTemplateService } from '../../application-template.service';
import { ApplicationTemplateContext } from '../../applicationtemplatecontext';
import { ApplicationService } from '../../application.service';
import { Authorizer } from '../../../users/authorizations';
import { catchError, Observable, of, Subscription } from 'rxjs';
import { ApplicationResponse } from '../../models/requests/applicationresponse';
import { resolveStatus } from '../../models/requests/mapping/applicationmapper';
import { ApplicationSearchComponent } from '../../search/application-search/application-search.component';
import { AlertComponent } from '../../../alert/alert.component';

/**
 * A template choice
 */
interface TemplateOption {
  /**
   * The value representing template ID
   */
  value: string;

  /**
   * The template name
   */
  label: string;
}

/**
 * An interface representing the different permissions the user viewing the applications page
 */
interface UserPermissions {
  /**
   * Determines if the user can create an application
   */
  createApplication: boolean;
  /**
   * Determines if the user can review an application
   */
  reviewApplication: boolean;
  /**
   * Determines if the user has an admin permission
   */
  admin: boolean;
}

/**
 * This component represents a listing of applications with the option to create a new application
 */
@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.css']
})
export class ApplicationListComponent implements OnInit, AfterViewInit, OnDestroy {
  /**
   * The form to use to create a new application
   */
  @Input() newAppForm: FormGroup;

  /**
   * Determine if the new application form should be displayed
   */
  displayNewApp: boolean = false;

  /**
   * The list of template options
   */
  templateOptions: TemplateOption[] = [];

  /**
   * Determines if template options have been initialised
   */
  templateOptionsInitialised: boolean = false;

  /**
   * An error message to display any erros that occur
   */
  error: string;

  /**
   * The permissions of the viewing user
   */
  userPermissions: UserPermissions;

  /**
   * The applications subscription
   */
  applications: Observable<ApplicationResponse[]>;

  /**
   * The search for searching applications
   */
  @ViewChild('applicationSearch')
  applicationSearch: ApplicationSearchComponent;

  /**
   * The alert for displaying search errors
   */
  @ViewChild('searchError')
  searchError: AlertComponent;

  /**
   * Subscription to the application search
   */
  private applicationSearchSubscription: Subscription;

  constructor(private fb: FormBuilder, 
    private templateService: ApplicationTemplateService,
    private authorizationService: AuthorizationService,
    private userContext: UserContext,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private applicationService: ApplicationService) {
    this.newAppForm = this.fb.group({
      template: this.fb.control('')
    });
  }

  private loadUserPermissions() {
    this.authorizationService.getPermissions().subscribe({
      next: permissions => {
        this.userContext.getUser().subscribe({
          next: user => {
            const userPermissions = user.role.permissions;
            this.userPermissions = {
              createApplication: Authorizer.hasPermission(userPermissions, permissions.CREATE_APPLICATION),
              reviewApplication: Authorizer.hasPermission(userPermissions, permissions.REVIEW_APPLICATIONS),
              admin: Authorizer.hasPermission(userPermissions, permissions.ADMIN)
            };

            this.applications = this.getApplications();
          },
          error: e => this.error = e
        });
      },
      error: e => this.error = e
    });
  }

  ngOnInit(): void {
    this.templateService.mapTemplateResponse().subscribe({
      next: response => {
        ApplicationTemplateContext.getInstance().addFromResponse(response);

        for (let key of Object.keys(response.applications)) {
          const value = key;
          const label = response.applications[value].name;

          this.templateOptions.push({value: value, label: label});
        }

        this.templateOptionsInitialised = true;
      },
      error: e => this.error = e
    });

    this.loadUserPermissions();
    this.displayNewApp = this.activatedRoute.snapshot.queryParams.create !== undefined;
  }

  ngAfterViewInit(): void {
    this.applicationSearchSubscription = this.applicationSearch.results.subscribe({
      next: (results: ApplicationResponse[]) => this.loadApplicationSearchResults(results),
      error: (e: string) => {
        this.searchError.message = e;
        this.searchError.show();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.applicationSearchSubscription) {
      this.applicationSearchSubscription.unsubscribe();
    }
  }

  loadApplicationSearchResults(results: ApplicationResponse[]) {
    this.applications = new Observable<ApplicationResponse[]>(observer => {
      observer.next(results);
      observer.complete();
    });
  }

  mapStatus(status: string) {
    return resolveStatus(status);
  }

  lastUpdated(lastUpdated: string) {
    return new Date(lastUpdated).toLocaleString();
  }

  toggleNewApp() {
    this.displayNewApp = !this.displayNewApp;
  }

  closeNewApp() {
    this.newAppForm.reset();
    this.displayNewApp = false;
  }

  createNewApplication() {
    let template: string = '';

    if (this.newAppForm) {
      template = this.newAppForm.get('template').value;
    }

    this.closeNewApp();

    this.router.navigate(['application'], {
      queryParams: {
        new: template
      }
    });
  }

  getApplications(): Observable<ApplicationResponse[]> {
    let viewable: boolean;

    if (this.userPermissions) {
      if (this.userPermissions.admin) {
        viewable = true;
      } else if (this.userPermissions.reviewApplication) {
        viewable = false;
      } else {
        viewable = true;
      }

      return this.applicationService.getUserApplications(viewable).pipe(
        catchError(e => {
          this.error = e;
          return of();
        })
      );
    }
  }
}
