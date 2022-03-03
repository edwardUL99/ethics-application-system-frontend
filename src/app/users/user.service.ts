import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subscriber, throwError } from 'rxjs';

import { UserResponseShortened } from './responses/userresponseshortened';
import { UserResponse } from './responses/userresponse';
import { CreateUpdateUserRequest } from './createupdateuserrequest';
import { UpdateRoleRequest } from './updaterolerequest';
import { GetAuthorizationResponse } from './responses/getauthorizationresponse';
import { RoleResponse } from './responses/roleresponse';
import { PermissionResponse } from './responses/permissionresponse';
import { User } from './user';
import { AuthService } from '../authentication/auth.service';
import { Role } from './role';
import { Permission } from './permission';
import { AccountResponse } from '../authentication/accountresponse';
import { catchError } from 'rxjs/operators';
import { getErrorMessage } from '../utils';
import { Account } from '../authentication/account';
import { mapRole } from './authorizations';

/**
 * This service gives the ability to create and load user profiles
 */
@Injectable()
export class UserService {

  constructor(private http: HttpClient,
    private authService: AuthService) { }

  /**
   * Create the request needed to get all users from the system
   * @param permission if present, this is the tag of a permission that all returned users should have
   */
  getAllUsers(permission?: string): Observable<UserResponseShortened[]> {
    if (permission) {
      return this.http.get<UserResponseShortened[]>('/api/users', {
        params: {
          permission: permission
        }
      });
    } else {
      return this.http.get<UserResponseShortened[]>('/api/users/');
    }
  }

  /**
   * Create a request to get a single user from the system
   * @param username the username of the user to load
   * @param email true if the username is an email, false if not
   */
  getUser(username: string, email: boolean = false): Observable<UserResponse> {
    return this.http.get<UserResponse>('/api/users/user', {
      params: {
        username: username,
        email: '' + email
      }
    });
  }

  /**
   * Create the request to create/update the user
   * @param request the request representing the create/update
   * @param update true to update the user, false to create them
   */
  createUpdateUser(request: CreateUpdateUserRequest, update: boolean): Observable<UserResponse> {
    if (update) {
      return this.http.put<UserResponse>('/api/users/user/', request);
    } else {
      return this.http.post<UserResponse>('/api/users/user/', request);
    }
  }

  /**
   * Create the request to create/update the user as an admin
   * @param request the request representing the create/update
   * @param update true to update the user, false to create them
   */
  createUpdateUserAdmin(request: CreateUpdateUserRequest, update: boolean): Observable<UserResponse> {
    if (update) {
      return this.http.put<UserResponse>('/api/users/admin/user/', request);
    } else {
      return this.http.post<UserResponse>('/api/users/admin/user/', request);
    }
  }

  /**
   * Create the request to update the user's role
   * @param request the request to update the role
   */
  updateUserRole(request: UpdateRoleRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>('/api/users/user/role/', request);
  }

  /**
   * Creates the request to get all roles from the server
   */
  getRoles(): Observable<GetAuthorizationResponse<RoleResponse>> {
    return this.http.get<GetAuthorizationResponse<RoleResponse>>('/api/users/roles/');
  }

  /**
   * Creates the request to get all permissions from the server
   */
  getPermissions(): Observable<GetAuthorizationResponse<PermissionResponse>> {
    return this.http.get<GetAuthorizationResponse<PermissionResponse>>('/api/users/permissions/');
  }

  /**
   * Populate the user with an account and send the user to the subject
   * @param subject the subject to send the user to
   * @param response the user response
   */
  private populateUserAccount(subject: Subscriber<User>, response: UserResponse) {
    let role: Role = mapRole(response.role);

    this.authService.getAccount(response.username, false)
      .pipe(
        catchError(e => this.handleError(e, false))
      )
      .subscribe({
        next: account => {
          let accountResponse: AccountResponse = account;

          subject.next(new User(response.username, response.name, 
            new Account(accountResponse.username, accountResponse.email, undefined, accountResponse.confirmed),
            response.department, role));
          subject.complete();
        },
        error: e => subject.error(e)
      });
  }

  private handleError(error: HttpErrorResponse, user: boolean) {
    if (error.status == 404) {
      return throwError(() => (user) ? '404-User':'404-Account');
    } else {
      return throwError(() => getErrorMessage(error));
    }
  }

  /**
   * Loads the user and its account at the same time. It's preferable however to use {@link getUser} and then use the userResponseMapper function in
   * userresponse.ts as usually you do not need all the account information. However, if you need the user and the account fully loaded, use this method.
   * @param username the username of the user
   * @param email true if the username is an email, false if username
   */
  loadUser(username: string, email: boolean = false): Observable<User> {
    return new Observable<User>(observable => {
      this.http.get<UserResponse>('/api/users/user', {
        params: {
          username: username,
          email: '' + email
        }
      })
      .pipe(
        catchError(e => this.handleError(e, true))
      )
      .subscribe({
        next: user => {
          const response: UserResponse = user;
          this.populateUserAccount(observable, response);
        },
        error: e => observable.error(e)
      });
    })
  }
}
