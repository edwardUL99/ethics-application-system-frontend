import { Injectable } from "@angular/core";
import { catchError, Observable, retry, share, Subscriber, throwError } from "rxjs";
import { User } from "./user";
import { UserService } from "./user.service";
import { Authorizer, Permissions, permissionsFrom, Roles, rolesFrom } from "./authorizations";
import { Permission } from "./permission";
import { HttpErrorResponse } from "@angular/common/http";
import { getErrorMessage } from "../utils";

/**
 * This service provides methods for authorizing users
 */
@Injectable()
export class AuthorizationService {
  /**
   * Cached permissions
   */
  private permissions: Permissions;
  /**
   * Cached roles
   */
  private roles: Roles;

  constructor(public readonly userService: UserService) {}

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
      this.getPermissions().subscribe({
        next: resolvedPermissions => {
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
      });
    });
  }

  /**
   * Get the roles of the system
   */
  getRoles(): Observable<Roles> {
    return new Observable<Roles>(observable => {
      if (!this.roles) {
        this.userService.getRoles()
          .pipe(
            retry(3),
            catchError(this.handleError),
            share()
          )
          .subscribe({
            next: response => {
              const roles = rolesFrom(response.authorizations);
              this.roles = roles;
              observable.next(this.roles);
              observable.complete();
            },
            error: e => {
              observable.error(e);
              observable.complete();
            }
          });
      } else {
        observable.next(this.roles);
        observable.complete();
      }
    });
  };

  /**
   * Get the permissions of the system
   */
   getPermissions(): Observable<Permissions> {
    return new Observable<Permissions>(observable => {
      if (!this.permissions) {
        this.userService.getPermissions()
          .pipe(
            retry(3),
            catchError(this.handleError),
            share()
          )
          .subscribe({
            next: response => {
              const permissions = permissionsFrom(response.authorizations);
              this.permissions = permissions;
              observable.next(this.permissions);
              observable.complete();
            },
            error: e => {
              observable.error(e);
              observable.complete();
            }
          });
      } else {
        observable.next(this.permissions);
        observable.complete();
      }
    });
  };
}