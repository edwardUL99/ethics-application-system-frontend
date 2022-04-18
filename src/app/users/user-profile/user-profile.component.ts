import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, AbstractControlOptions, AsyncValidatorFn, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, Observable, of, retry, throwError } from 'rxjs';
import { AlertComponent } from '../../alert/alert.component';
import { AuthService } from '../../authentication/auth.service';
import { AuthenticationRequest } from '../../authentication/authenticationrequest';
import { UpdateAccountRequest } from '../../authentication/updateaccountrequest';
import { getErrorMessage } from '../../utils';
import { PasswordConfirmValidator } from '../../validators';
import { AuthorizationService } from '../authorization.service';
import { Roles } from '../authorizations';
import { CreateUpdateUserRequest } from '../createupdateuserrequest';
import { userResponseMapper } from '../responses/userresponse';
import { Role } from '../role';
import { UpdateRoleRequest } from '../updaterolerequest';
import { User } from '../user';
import { UserService } from '../user.service';
import { UserContext } from '../usercontext';

// custom old password validator
export function OldPasswordValidator(username: string, authService: AuthService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors> => {
    const password = control.value;
    const handleError = (error: HttpErrorResponse) => {
      if (error.status == 400 && error.error['error'] == 'invalid_credentials') {
        return of({oldPassword: 'The old password is not valid'});
      } else {
        return of({oldPassword: 'An error occurred checking the validity of the old password'});
      }
    }

    return authService.authenticate(new AuthenticationRequest(username, password, false, 2))
      .pipe(
        catchError(handleError),
        map((result: any) => {
          if ('token' in result) {
            return null;
          } else if ('oldPassword' in result) {
            return result;
          } else {
            return null
          }
        })
      );
  }
}

/**
 * This class represents a setting on a user's profile
 */
export class UserSetting {
  /**
   * Create a user setting object
   * @param label the label for the setting to trigger 
   * @param callback the callback to trigger when the setting is clicked
   */
  constructor(public label: string, public callback: () => void) {}
}

/**
 * Mapping of role ID to Role
 */
export type RolesMapping = {
  [key: number]: Role;
}

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  /**
   * The username of the user being loaded
   */
  private username: string;
  /**
   * The user that the profile is rendering
   */
  user: User;
  /**
   * The user viewing the profile. If it is the same as the user's profile, this will be the same as user
   */
  viewingUser: User;
  /**
   * An error that occurred loading the page
   */
  loadError: string;
  /**
   * The settings to display for this user. If this array is undefined, settings shouldn't be displayed
   */
  settings: UserSetting[];
  /**
   * The roles parsed from the server
   */
  roles: Roles;
  /**
   * Mapping of role ID to roles
   */
  private rolesMapping: RolesMapping = {};
  /**
   * A form group for editing user details
   */
  editDetailsForm: FormGroup;
  /**
   * Determines if edit details are displayed
   */
  editDetailsDisplayed: boolean = false;
  /**
   * The alert for messages related to the editing of user details
   */
  @ViewChild('editAlert')
  editAlert: AlertComponent;
  /**
   * A form group for updating the user's password
   */
  editPasswordForm: FormGroup;
  /**
   * Determines if the edit password form is displayed
   */
  editPasswordDisplayed: boolean = false;
  /**
   * The alert for messages related to password updates
   */
  @ViewChild('passwordAlert')
  passwordAlert: AlertComponent;
  /**
   * The form to allow changing a user's role
   */
  editRoleForm: FormGroup;
  /**
   * The currently seleted role
   */
  selectedRole: Role;
  /**
   * Determines if the edit role form is displayed
   */
  editRoleDisplayed: boolean = false;
  /**
   * The alert for messages related to role updates
   */
  @ViewChild('roleAlert')
  roleAlert: AlertComponent;

  constructor(private route: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService,
    private userContext: UserContext,
    private authorizationService: AuthorizationService,
    private router: Router,
    private fb: FormBuilder) { 
    this.editDetailsForm = this.fb.group({
      name: this.fb.control('', Validators.required),
      department: this.fb.control('', Validators.required)
    });

    const options: AbstractControlOptions = {
      validators: Validators.required,
      updateOn: 'blur'
    };

    this.editPasswordForm = this.fb.group({
      oldPassword: this.fb.control('', options),
      passwordGroup: this.fb.group({
        password: this.fb.control('', Validators.required,),
        confirmPassword: this.fb.control('', Validators.required)
      }, {validators: PasswordConfirmValidator()})
    });

    this.editRoleForm = this.fb.group({
      role: this.fb.control('', Validators.required)
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.username = params['username'];
      this.loadError = undefined;
      this.loadUser(this.username);
    });
  }

  get name() {
    return this.editDetailsForm.get('name');
  }

  get department() {
    return this.editDetailsForm.get('department');
  }

  get passwordGroup() {
    return this.editPasswordForm.get('passwordGroup');
  }

  get oldPassword() {
    return this.editPasswordForm.get('oldPassword');
  }

  get password() {
    return this.editPasswordForm.get('passwordGroup.password');
  }

  get confirmPassword() {
    return this.editPasswordForm.get('passwordGroup.confirmPassword');
  }

  get role() {
    return this.editRoleForm.get('role');
  }

  centerBox(): boolean {
    return !this.editDetailsDisplayed && !this.editPasswordDisplayed && !this.editRoleDisplayed;
  }
  
  private handleError(error: HttpErrorResponse, username: string) {
    if (error.status == 404) {
      return throwError(() => `The user ${username} does not exist`);
    } else {
      return throwError(() => getErrorMessage(error));
    }
  }

  private syncEditDetails() {
    this.name.setValue(this.user.name);
    this.department.setValue(this.user.department);
  }

  private addOldPasswordValidator() {
    const oldPassword = this.oldPassword;

    oldPassword.clearAsyncValidators();
    oldPassword.addAsyncValidators(OldPasswordValidator(this.user.username, this.authService));
  }

  private loadRoles() {
    this.authorizationService.getRoles()
      .subscribe({
        next: roles => {
          this.roles = roles;

          Object.keys(this.roles).forEach(key => {
            const role = this.roles[key];
            this.rolesMapping[role.id] = role;
          });
        },
        error: e => this.loadError = e
      });
  }

  getRoles(): Role[] {
    // get the roles in a form that is able to be parsed by the templat
    const roles = [];

    if (this.roles) {
      Object.keys(this.roles).forEach(key => roles.push(this.roles[key]));
    }

    return roles;
  } 

  private loadAdminSettings() {
    this.loadRoles();
    this.settings.push(new UserSetting('Edit Details', () => this.toggleEditDisplayed()));
    this.settings.push(new UserSetting('Edit User Role', () => this.toggleRoleDisplayed()));
  }

  private loadSettings() {
    this.settings = [];

    const ownUser = this.user == this.viewingUser;
    
    if (ownUser) {
      this.settings.push(new UserSetting('Edit Details', () => this.toggleEditDisplayed()));
      this.settings.push(new UserSetting('Change Password', () => this.togglePasswordDisplayed()));

      this.addOldPasswordValidator(); // can change password so add the old password validator
    } else {
      this.authorizationService.authorizeUserPermissions(this.viewingUser, ['ADMIN'], true)
        .subscribe({
          next: admin => {
            if (admin) {
              this.loadAdminSettings();
            }
          },
          error: e => this.loadError = e
        });
    }
  }

  private loadUser(username: string) {
    if (username) {
      this.userService.getUser(username)
        .pipe(
          retry(3),
          catchError(e => this.handleError(e, username))
        )
        .subscribe({
          next: response => {
            this.user = userResponseMapper(response);
            this.loadViewingUser();
          },
          error: e => this.loadError = e
        });
    } else {
      // no username provided, so load own user profile
      try {
        this.userContext.getUser().subscribe({
          next: user => {
            this.user = user;
            this.viewingUser = user;
            this.loadSettings();
          },
          error: e => this.loadError = e
        });
      } catch (e) {
        console.log(e);
        this.router.navigate(['logout']);
      }
    }
  }

  private loadViewingUser() {
    try {
      if (this.userContext.getUsername() == this.user.username) {
        this.viewingUser = this.user;
        this.loadSettings();
      } else {
        this.userContext.getUser().subscribe({
          next: user => {
            this.viewingUser = user;
            this.loadSettings();
          },
          error: e => this.loadError = e
        });
      }
    } catch (e) {
      console.log(e);
      this.router.navigate(['logout']);
    }
  }

  toggleEditDisplayed(explicit?: boolean) {
    if (explicit != undefined) {
      this.editDetailsDisplayed = explicit;
    } else {
      this.editDetailsDisplayed = !this.editDetailsDisplayed;
    }

    if (!this.editDetailsDisplayed) {
      this.editDetailsForm.reset();
    } else {
      this.syncEditDetails();
    }
  }

  private displayEditAlert(message: string, error: boolean = false) {
    this.editAlert?.displayMessage(message, error);
  }

  updateUserDetails() {
    const name = this.name.value;
    const department = this.department.value;
    const request = new CreateUpdateUserRequest(this.user.username, name, department);

    const userResponse = (this.viewingUser == this.user) ? 
      this.userService.createUpdateUser(request, true) : this.userService.createUpdateUserAdmin(request, true);

    userResponse
      .pipe(
        catchError(e => this.handleError(e, this.user.username))
      )
      .subscribe({
        next: response => {
          this.user.name = response.name;
          this.user.department = response.department;
          this.userContext.update(this.user);
          this.displayEditAlert("User updated successfully");
        },
        error: e => this.displayEditAlert(e, true)
      });
  }

  togglePasswordDisplayed(explicit?: boolean) {
    if (explicit != undefined) {
      this.editPasswordDisplayed = explicit;
    } else {
      this.editPasswordDisplayed = !this.editPasswordDisplayed;
    }

    if (!this.editPasswordDisplayed) {
      this.editPasswordForm.reset();
    }
  }

  private displayPasswordAlert(message: string, error: boolean = false) {
    this.passwordAlert.displayMessage(message, error);
  }

  updatePassword() {
    const username = this.user.username;
    const password = this.password.value;
    const request = new UpdateAccountRequest(username, password);

    this.authService.updateAccount(request)
      .pipe(
        catchError(e => throwError(() => getErrorMessage(e)))
      )
      .subscribe({
        next: response => {
          if (response.message == 'account_updated') {
            this.displayPasswordAlert('The password has been changed successfully');
            this.editPasswordForm.reset();
          } else {
            this.displayPasswordAlert('An unknown error occurred, please try again', true);
          }
        },
        error: e => this.displayPasswordAlert(e, true)
      });
  }

  private syncRoleDetails() {
    this.role.setValue(this.user?.role?.id);
    this.roleSelected({target: {value: this.user?.role?.id}})
  }

  toggleRoleDisplayed(explicit?: boolean) {
    if (explicit != undefined) {
      this.editRoleDisplayed = explicit;
    } else {
      this.editRoleDisplayed = !this.editRoleDisplayed;
    }

    if (!this.editRoleDisplayed) {
      this.editRoleForm.reset();
    } else {
      this.syncRoleDetails();
    }
  }

  private displayRoleAlert(message: string, error: boolean = false) {
    this.roleAlert.displayMessage(message, error);
  }

  private confirmSingleUserRole(role: number) {
    let foundRole: Role = undefined;

    for (let key of Object.keys(this.roles)) {
      let r = this.roles[key];

      if (r.id == role) {
        foundRole = r;
        break;
      }
    }

    if (foundRole && foundRole.singleUser) {
      if (foundRole.equals(this.viewingUser.role)) {
        const confirmed = confirm("The selected role can only be allocated to one user at a time and you currently have the role. Continuing will "
          + "downgrade your role to a Committee Member. Do you wish to continue?");

        return {confirmed: confirmed, replaceRole: true};
      } else {
        const confirmed = confirm("The selected role can only be allocated to one user at a time. Continuing will downgrade the user with the role currently to "
          + "a Committee Member. Do you wish to continue?");

        return {confirmed: confirmed, replaceRole: false};
      }
    } else {
      return {confirmed: true, replaceRole: false};
    }
  }

  roleSelected(event: any) {
    const value = event.target.value;

    if (value in this.rolesMapping) {
      this.selectedRole = this.rolesMapping[value];
    }
  }

  private toggleAllSettings() {
    this.toggleEditDisplayed(false);
    this.togglePasswordDisplayed(false);
    this.toggleRoleDisplayed(false);
  }

  updateRole() {
    const role = this.role.value;
    const request: UpdateRoleRequest = new UpdateRoleRequest(this.user.username, role);
    const roleConfirmation = this.confirmSingleUserRole(role);

    if (roleConfirmation.confirmed) {
      this.userService.updateUserRole(request)
        .pipe(
          catchError(e => this.handleError(e, this.user.username))
        )
        .subscribe({
          next: response => {
            const mapped = userResponseMapper(response);
            this.user.role = mapped.role;
            this.displayRoleAlert('User role updated successfully');

            if (roleConfirmation.replaceRole) {
              this.viewingUser.role = this.roles[this.viewingUser.role.downgradeTo];
              this.loadSettings();
              this.toggleAllSettings();
            }
          },
          error: e => this.displayRoleAlert(e. true)
        });
    } else {
      this.syncRoleDetails();
    }
  }
}
