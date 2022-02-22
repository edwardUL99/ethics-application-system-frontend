import { Injectable } from "@angular/core";
import { catchError, Observable, retry, Subscriber, throwError } from "rxjs";
import { User } from "./user";
import { UserService } from "./user.service";
import { Authorizer, Permissions, permissionsFrom } from "./authorizations";
import { Permission } from "./permission";
import { HttpErrorResponse } from "@angular/common/http";
import { getErrorMessage } from "../utils";

/**
 * This service provides methods for authorizing users
 */
@Injectable()
export class AuthorizationService {
  constructor(private userService: UserService) {}

  private handleError(e: HttpErrorResponse) {
    return throwError(() => getErrorMessage(e));   
  }

  /**
   * Authorize the user permissions
   * @param user the user to authorize
   * @param permissions the tags of the permissions to authorise
   * @param requireAll true to require all permissions, false to require at least 1
   */
  authorizeUserPermissions(user: User, permissions: string[], requireAll: boolean): Observable<boolean>;
  /**
   * Authorize the user permissions
   * @param user the user to authorize, the observable will be resolved
   * @param permissions the tags of the permissions to authorise
   * @param requireAll true to require all permissions, false to require at least 1
   */
  authorizeUserPermissions(user: Observable<User>, permissions: string[], requireAll: boolean): Observable<boolean>;
  /**
   * Authorize the user permissions
   * @param user the user to authorize, can be an observable and will be resolved
   * @param permissions the tags of the permissions to authorise
   * @param requireAll true to require all permissions, false to require at least 1
   */
  authorizeUserPermissions(user: any, permissions: string[], requireAll: boolean): Observable<boolean> {
    const userResolveCallback = (user: User, resolvedPermissions: Permissions, observer: Subscriber<boolean>) => {
      const mappedPermissions = new Set<Permission>(permissions.map(p => resolvedPermissions[p]));
      observer.next(Authorizer.requiredPermissions(user.role, mappedPermissions, requireAll));
      observer.complete();
    };

    return new Observable<boolean>(observer => {
      this.userService.getPermissions()
      .pipe(
        retry(3),
        catchError(this.handleError)
      )  
      .subscribe({
        next: response => {
          const resolvedPermissions = permissionsFrom(response.authorizations);

          if (user instanceof Observable) {
            user.subscribe({
              next: user => userResolveCallback(user, resolvedPermissions, observer),
              error: e => {
                observer.error(e);
                observer.complete();
              }
            });
          } else {
            userResolveCallback(user, resolvedPermissions, observer);
          }
        },
        error: e => {
          observer.error(e);
          observer.complete();
        }
      })
    })
  }
}