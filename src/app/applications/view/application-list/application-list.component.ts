import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { UserContext } from '../../../users/usercontext';
import { permissionsFrom, Authorizer } from '../../../users/authorizations';
import { AuthorizationService } from '../../../users/authorization.service';
import { ApplicationTemplateService } from '../../application-template.service';
import { ApplicationTemplateContext } from '../../applicationtemplatecontext';

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
   * Determines if the user can create an application or not
   */
  canCreateApplication: boolean = false;

  constructor(private fb: FormBuilder, 
    private templateService: ApplicationTemplateService,
    private authorizationService: AuthorizationService,
    private userContext: UserContext,
    private router: Router) {
    this.newAppForm = this.fb.group({
      template: this.fb.control('')
    });
  }

  private checkCreateApplicationPermission() {
    this.authorizationService.authorizeUserPermissions(this.userContext.getUser(), ['CREATE_APPLICATION'], true)
      .subscribe({
        next: r => this.canCreateApplication = r,
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

    this.checkCreateApplicationPermission();
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
}
