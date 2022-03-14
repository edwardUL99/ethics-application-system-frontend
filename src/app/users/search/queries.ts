import { FormBuilder, Validators } from '@angular/forms';
import { SearchQuery, SearchControl, Query, Queries, SearchControlOption } from '../../search/searchcomponent';
import { Roles } from '../authorizations';

/**
 * This class represents a query that searches for a user by name
 */
export class NameQuery implements SearchQuery {
  /**
   * The constructed controls
   */
  private controls: SearchControl[];
  
  createControls(fb: FormBuilder): SearchControl[] {
    if (!this.controls) {
      const controls = [];

      controls.push(new SearchControl('Name:', fb.control('', Validators.required), 'text', undefined, 'The name of the user to search for'));
      this.controls = controls;
    }

    return this.controls;
  }
 
  constructQuery(): Query {
    const username = this.controls[0].control.value;

    return new Query(`name:~${username}`);
  }
}

/**
 * This class represents a query that searches for a user by username
 */
export class UsernameQuery implements SearchQuery {
  /**
   * The constructed controls
   */
  private controls: SearchControl[];
  
  createControls(fb: FormBuilder): SearchControl[] {
    if (!this.controls) {
      const controls = [];

      controls.push(new SearchControl('Username:', fb.control('', Validators.required), 'text', undefined, 'The username of the user to search for'));
      this.controls = controls;
    }

    return this.controls;
  }

  constructQuery(): Query {
    const username = this.controls[0].control.value;

    return new Query(`username:~${username}`);
  }
}

/**
 * This class represents a query that searches for a user by email
 */
export class EmailQuery implements SearchQuery {
  /**
   * The constructed controls
   */
  private controls: SearchControl[];
  
  createControls(fb: FormBuilder): SearchControl[] {
    if (!this.controls) {
      const controls = [];

      controls.push(new SearchControl('E-mail:', fb.control('', Validators.required), 'text', undefined, 'The e-mail of the user to search for'));
      this.controls = controls;
    }

    return this.controls;
  }

  constructQuery(): Query {
    const username = this.controls[0].control.value;

    return new Query(`account.email=${username}`);
  }
}

/**
 * A query to search for users with the given role
 */
export class RoleQuery implements SearchQuery {
  /**
   * The roles in the system
   */
  private roles: Roles;
  /**
   * The constructed controls
   */
  private controls: SearchControl[];

  constructor(roles: Roles) {
    this.roles = roles;
  }

  createControls(fb: FormBuilder): SearchControl[] {
    if (!this.controls) {
      const controls = [];

      const options: SearchControlOption[] = Object.keys(this.roles).map(k => this.roles[k].name).map(name => {
        return {label: name, value: name}
      });

      controls.push(new SearchControl("Role:", fb.control('', Validators.required), undefined, undefined, 'The role to find users with', options));
      this.controls = controls;
    }
    
    return this.controls;
  }

  constructQuery(): Query {
    const role = this.controls[0].control.value;

    return new Query(`role.name=${role}`);
  }
}

/**
 * Creates the base queries that can be constructed without querying the server
 */
export function createBaseQueries(): Queries {
  return [
    {label: 'Name', value: 'name', query: new NameQuery()},
    {label: 'Username', value: 'username', query: new UsernameQuery()},
    {label: 'E-mail', value: 'email', query: new EmailQuery()}
  ];
}