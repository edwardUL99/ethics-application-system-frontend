import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Queries } from '../../search/searchcomponent';

import { AuthorizationService } from '../authorization.service';
import { createBaseQueries, RoleQuery } from './queries';

/**
 * This service produces the search queries for users
 */
@Injectable()
export class UserQueryService {
  constructor(private authorizationService: AuthorizationService) {}

  /**
   * Get the list of queries for the Users search
   */
  getQueries(): Observable<Queries> {
    const queries = createBaseQueries();

    return new Observable<Queries>(observer => {
      this.authorizationService.getRoles()
        .subscribe({
          next: roles => {
            queries.push({label: 'Role', value: 'role', query: new RoleQuery(roles)});
            observer.next(queries);
            observer.complete();
          },
          error: e => {
            observer.error(e);
            observer.complete();
          }
        });
    });
  }
}