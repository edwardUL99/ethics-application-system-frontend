import { FormBuilder, Validators } from '@angular/forms';
import { Queries, Query, SearchControl, SearchControlOption, SearchQuery } from '../../search/searchcomponent';
import { ApplicationStatus } from '../models/applications/applicationstatus';


/**
 * This query allows searching for applications that have users assigned to it
 */
 class AssignedUserQuery implements SearchQuery {
  /**
   * The controls created by createControls
   */
  private controls: SearchControl[];

  createControls(fb: FormBuilder): SearchControl[] {
    const controls = [];

    controls.push(new SearchControl('Username:', fb.control('', [Validators.required]), 'text', undefined, 'Enter the username of the committee member'));
    this.controls = controls;

    return controls;
  }

  constructQuery(): Query {
    const value: string = this.controls[0].control.value;

    return new Query(`assigned:=${value}`);
  }
}

/**
 * A query that allows searching for applications based on a given date range
 */
class SubmittedDateRangeQuery implements SearchQuery {
  /**
   * The controls created by createControls
   */
  private controls: SearchControl[];

  private getDate() {
    let date = new Date();
    const offset = date.getTimezoneOffset()
    date = new Date(date.getTime() - (offset*60*1000))
    
    return date.toISOString().split('T')[0]
  }

  createControls(fb: FormBuilder): SearchControl[] {
    const controls = [];

    const now = this.getDate();
    controls.push(new SearchControl('Start:', fb.control(now, [Validators.required]), 'date', undefined, 
      'The start of the date range to search'));
    controls.push(new SearchControl('End: ', fb.control(now, [Validators.required]), 'date', undefined,
      'The end of the date range to search'));
    this.controls = controls;

    return controls;
  }

  constructQuery(): Query {
    const start = this.controls[0].control.value;
    const end = this.controls[1].control.value;

    return new Query(`submittedTime>${start},submittedTime<${end}`);
  }
}

/**
 * A query that allows searching for applications based on the user that created it
 */
class UserQuery implements SearchQuery {
  /**
   * The controls created by createControls
   */
  private controls: SearchControl[];

  createControls(fb: FormBuilder): SearchControl[] {
    const controls = [];

    controls.push(new SearchControl('Username:', fb.control('', [Validators.required]), 'text', undefined, 'The username of the user'));
    this.controls = controls;

    return controls;
  }

  constructQuery(): Query {
    const username = this.controls[0].control.value;

    return new Query(`user.username=${username}`);
  }
}

/**
 * This query allows querying applications for their status
 */
class StatusQuery implements SearchQuery {
  /**
   * The controls created by createControls
   */
  private controls: SearchControl[];

  createControls(fb: FormBuilder): SearchControl[] {
    const controls = [];

    const options: SearchControlOption[] = [];

    for (let value of Object.keys(ApplicationStatus)) {
      options.push({value: value, label: ApplicationStatus[value]});
    }

    controls.push(new SearchControl('Status:', fb.control('', [Validators.required]), undefined, undefined, 'The status of the application', options));
    this.controls = controls;

    return controls;
  }

  constructQuery(): Query {
    const status = this.controls[0].control.value;

    return new Query(`status=${status}`);
  }
}

/**
 * The queries defined for the applications search
 */
 export const QUERIES: Queries = [
  {label: 'Status', value: 'status', query: new StatusQuery()},
  {label: 'Assigned User', value: 'assigned-user', query: new AssignedUserQuery()},
  {label: 'Submitted Date', value: 'submitted-date', query: new SubmittedDateRangeQuery()},
  {label: 'Applicant', value: 'user', query: new UserQuery()}
];