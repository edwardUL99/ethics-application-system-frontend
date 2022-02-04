import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject ,  throwError } from 'rxjs';

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
import { catchError, retry } from 'rxjs/operators';
import { getErrorMessage } from '../utils';
import { Account } from '../authentication/account';

/**
 * This service gives the ability to create and load user profiles
 */
@Injectable()
export class UserService {

  constructor(private http: HttpClient,
    private authService: AuthService) { }

  /**
   * Create the request needed to get all users from the system
   */
  getAllUsers(): Observable<UserResponseShortened[]> {
    return this.http.get<UserResponseShortened[]>("/api/users/");
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
  private populateUserAccount(subject: Subject<User>, response: UserResponse) {
    let role: Role = null;
    let permissions: Permission[] = [];
      
    for (let permissionResponse of response.role.permissions) {
      permissions.push(new Permission(permissionResponse.id, permissionResponse.name, permissionResponse.description));
    }

    role = new Role(response.role.id, response.role.name, response.role.description, permissions, response.role.singleUser);

    this.authService.getAccount(response.username, false)
      .pipe(
        catchError(e => this.handleError(e, false))
      )
      .subscribe({
        next: account => {
          let accountResponse: AccountResponse = account;

          subject.next(new User(response.username, response.name, 
            new Account(accountResponse.username, accountResponse.email, null, accountResponse.confirmed),
            response.department, role));
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
   * Loads the user and its account
   * @param username the username of the user
   * @param email true if the username is an email, false if username
   */
  loadUser(username: string, email: boolean = false): Observable<User> {
    let subject: Subject<User> = new Subject<User>();

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
        this.populateUserAccount(subject, response);
      },
      error: e => subject.error(e)
    });

    return subject.asObservable();
  }
}
