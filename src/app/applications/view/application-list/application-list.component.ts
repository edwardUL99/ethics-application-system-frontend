import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserContext } from '../../../users/usercontext';
import { AuthorizationService } from '../../../users/authorization.service';
import { ApplicationTemplateService } from '../../application-template.service';
import { ApplicationTemplateContext } from '../../applicationtemplatecontext';
import { Authorizer } from '../../../users/authorizations';
import { UserPermissions } from '../../userpermissions';
import { ApplicationTemplate } from '../../models/applicationtemplate';
import { environment } from '../../../../environments/environment';

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
 * This component represents a listing of applications with the option to create a new application
 */
@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.css']
})
export class ApplicationListComponent implements OnInit {
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
   * The selected template
   */
  chosenTemplate: ApplicationTemplate;

  /**
   * Determines if the default template has been chose
   */
  defaultTemplate: ApplicationTemplate;

  constructor(private fb: FormBuilder, 
    private templateService: ApplicationTemplateService,
    private authorizationService: AuthorizationService,
    private userContext: UserContext,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
    this.newAppForm = this.fb.group({
      template: this.fb.control('')
    });
  }

  private loadUserPermissions() {
    this.authorizationService.getPermissions().subscribe({
      next: permissions => {
        this.userContext.getUser().subscribe({
          next: user => {
            const userPermissions = new Set(user.role.permissions);
            this.userPermissions = {
              createApplication: Authorizer.hasPermission(userPermissions, permissions.CREATE_APPLICATION),
              reviewApplication: Authorizer.hasPermission(userPermissions, permissions.REVIEW_APPLICATIONS),
              admin: Authorizer.hasPermission(userPermissions, permissions.ADMIN)
            };
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

          if (value == environment.default_template_id) {
            this.defaultTemplate = response.applications[value];
            this.chosenTemplate = this.defaultTemplate;
          }
        }

        this.templateOptionsInitialised = true;
      },
      error: e => this.error = e
    });

    this.loadUserPermissions();
    this.displayNewApp = this.activatedRoute.snapshot.queryParams.create !== undefined;
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

  onChange(event: any) {
    const value = event.target.value;

    if (value == '') {
      this.chosenTemplate = this.defaultTemplate;
    } else {
      for (let option of this.templateOptions) {
        if (option.value == value) {
          this.chosenTemplate = ApplicationTemplateContext.getInstance().getTemplate(value);
          break;
        }
      }
    }
  }

  unknownError(error: any) {
    this.error = error;
  }
}
