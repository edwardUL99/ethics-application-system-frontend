import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { GroupBy, Grouper, GroupOption, GroupSort, OrderBy, OrderOption } from '../../../search/grouping';
import { SearchEndpoints } from '../../../search/search-endpoints';
import { SearchService } from '../../../search/search.service';
import { Queries, Query, SearchComponent } from '../../../search/searchcomponent';
import { ApplicationStatus } from '../../models/applications/applicationstatus';
import { ApplicationResponse, SubmittedApplicationResponse } from '../../models/requests/applicationresponse';
import { resolveStatus } from '../../models/requests/mapping/applicationmapper';
import { QUERIES } from '../queries';
import { ApplicationIDOrder, LastUpdatedOrder } from '../sort';

/**
 * Sorts the groups by Month Year in descending order
 */
function dateGroupSort(a: string, b: string): number {
  const getMonthYear = (key: string) => {
    const split = key.split(' ');
    const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
    const monthNumber = months.indexOf(split[0]);
    const year = parseInt(split[1]);

    return [monthNumber, year];
  }

  const aMonthYear = getMonthYear(a);
  const bMonthYear = getMonthYear(b);
  const aDate = new Date(aMonthYear[1], aMonthYear[0]).valueOf();
  const bDate = new Date(bMonthYear[1], bMonthYear[0]).valueOf();

  if (aDate == bDate) {
    return 0;
  } else {
    return aDate > bDate ? -1 : 1;
  }
}

/**
 * Groups applications by the month they were submitted
 */
class ApplicationSubmittedDateGrouper implements Grouper<ApplicationResponse> {
  getGroup(value: ApplicationResponse): string {
    if ('submittedTime' in value) {
      const submittedTime = (value as SubmittedApplicationResponse).submittedTime;

      if (!submittedTime) {
        return undefined;
      } else {
        const monthNames = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"];
        const date = new Date(submittedTime);
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();

        return `${month} ${year}`;
      }
    } else {
      return undefined;
    }
  }

  getGroupSort(): GroupSort {
    return dateGroupSort;
  }
}

/**
 * Groups applications by status
 */
class ApplicationStatusGrouper implements Grouper<ApplicationResponse> {
  getGroup(value: ApplicationResponse): string {
    return resolveStatus(value.status);
  }

  getGroupSort(): GroupSort {
    const statuses = Object.keys(ApplicationStatus).map(key => ApplicationStatus[key]);

    return (a: string, b: string) => {
      const aKey = statuses.indexOf(a);
      const bKey = statuses.indexOf(b);

      return (aKey < bKey) ? -1 : ((aKey > bKey) ? 1 : 0);
    }
  }
}

/**
 * Groups applications by assigned committee member
 */
class ApplicationAssignedGrouper implements Grouper<ApplicationResponse> {
  getGroup(value: ApplicationResponse): string | string[] {
    if ('assignedCommitteeMembers' in value) {
      const assigned = (value as SubmittedApplicationResponse).assignedCommitteeMembers;
      
      if (!assigned || assigned.length == 0) {
        return 'Unassigned';
      } else {
        return assigned.map(a => a.username);
      }
    } else {
      return undefined;
    }
  }

  getGroupSort(): GroupSort {
    return (a: string, b: string) => {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    }
  }
}

@Component({
  selector: 'app-application-search',
  templateUrl: './application-search.component.html',
  styleUrls: ['./application-search.component.css']
})
export class ApplicationSearchComponent implements OnInit, SearchComponent<ApplicationResponse> {
  /**
   * The results event emitter
   */
  @Output() results: EventEmitter<ApplicationResponse[]> = new EventEmitter<ApplicationResponse[]>();
  /**
   * Indicates that search has been reset
   */
  @Output() reset: EventEmitter<boolean> = new EventEmitter<boolean>();
  /**
   * Emits the group by object to group results with
   */
  @Output() groupBy: EventEmitter<GroupBy<ApplicationResponse>> = new EventEmitter<GroupBy<ApplicationResponse>>();
  /**
   * Emits the order by object to order results with
   */
   @Output() orderBy: EventEmitter<OrderBy<ApplicationResponse>> = new EventEmitter<OrderBy<ApplicationResponse>>();
  /**
   * The endpoint to search with
   */
  readonly endpoint: SearchEndpoints = SearchEndpoints.APPLICATIONS;
  /**
   * The list of group by options
   */
  groupOptions: GroupOption[];
  /**
   * The list of order by options
   */
  orderOptions: OrderOption[];
  /**
   * The queries supported by the component
   */
  queries: Queries = QUERIES;
  /**
   * The last executed search query
   */
  lastSearch: Query;

  constructor(private searchService: SearchService) {
    this.groupOptions = [
      {label: 'Month Submitted', value: 'month-submitted', grouper: new ApplicationSubmittedDateGrouper()},
      {label: 'Status', value: 'status', grouper: new ApplicationStatusGrouper()},
      {label: 'Assigned Committee Member', value: 'assigned', grouper: new ApplicationAssignedGrouper()}
    ];

    this.orderOptions = [
      {label: 'Application ID (Ascending)', value: 'application-id-asc', orderBy: new ApplicationIDOrder(true)},
      {label: 'Application ID (Descending)', value: 'application-id-desc', orderBy: new ApplicationIDOrder(false)},
      {label: 'Updated (Ascending)', value: 'application-updated-asc', orderBy: new LastUpdatedOrder(true)},
      {label: 'Updated (Descending)', value: 'application-updated-desc', orderBy: new LastUpdatedOrder(false)}
    ]
  }

  ngOnInit(): void {}

  search(query: Query): void {
    this.searchService.search<ApplicationResponse>(this.endpoint, query.query, query.or)
      .subscribe({
        next: response => {
          this.results.emit(response.results);
          this.lastSearch = query;
        },
        error: e => this.results.error(e)
      });
  }

  refreshSearch() {
    if (this.lastSearch) {
      this.search(this.lastSearch);
    }
  }

  doReset() {
    this.reset.emit(true);
  }

  doGroup(groupBy: GroupBy<any>) {
    this.groupBy.emit(groupBy);
  }

  doOrder(orderBy: OrderBy<any>) {
    this.orderBy.emit(orderBy);
  }
}
