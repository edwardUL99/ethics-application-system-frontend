import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { catchError, of, Subscriber, Subscription } from 'rxjs';
import { AlertComponent } from '../../../alert/alert.component';
import { GroupBy, Grouped, Grouper, GroupOption, GroupSort, OrderBy, OrderOption } from '../../../search/grouping';
import { ResultsOperatorComponent } from '../../../search/results-operator/results-operator.component';
import { ApplicationService } from '../../application.service';
import { ApplicationStatus } from '../../models/applications/applicationstatus';
import { ApplicationResponse, SubmittedApplicationResponse } from '../../models/requests/applicationresponse';
import { resolveStatus } from '../../models/requests/mapping/applicationmapper';
import { UserPermissions } from '../../userpermissions';
import { ApplicationSearchComponent } from '../application-search/application-search.component';
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
  selector: 'app-application-results',
  templateUrl: './application-results.component.html',
  styleUrls: ['./application-results.component.css']
})
export class ApplicationResultsComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  /**
   * The applications subscription
   */
  applications: ApplicationResponse[];
  /**
   * The unordered applications
   */
  private unorderedApplications: ApplicationResponse[];
  /**
   * Determines if ordering was requested manually
   */
  private ordered: boolean;
  /**
   * Indicated that an operations reset was requested
   */
  private resetOperations: boolean;
  /**
   * Allows for undo operation of ordering
   */
  private unorderGrouped: Grouped<ApplicationResponse>;
  /**
   * This field is set if applications are grouped
   */
  grouped: Grouped<ApplicationResponse>;
  /**
   * The permissions of the user viewing the application results
   */
  @Input() permissions: UserPermissions;
  /**
  * The search for searching applications
  */
  @ViewChild('applicationSearch')
  applicationSearch: ApplicationSearchComponent;
  /**
  * The alert for displaying search errors
  */
  @ViewChild('searchError')
  searchError: AlertComponent;
  /**
   * Component for performing operations on the results
   */
  _resultsOperator: ResultsOperatorComponent;
  /**
   * A flag to indicate that listed applications are from a search result
   */
  private searchResults: boolean;
  /**
   * The list of group by options
   */
  groupOptions: GroupOption[];
  /**
  * The list of order by options
  */
  orderOptions: OrderOption[];
  /**
   * Emits when an unknown error occurs
   */
  @Output() error: EventEmitter<any> = new EventEmitter<any>();

  /**
   * Subscription to the application search
   */
  private applicationSearchSubscription: Subscription;

  constructor(private applicationService: ApplicationService,
    private cd: ChangeDetectorRef) {
    this.groupOptions = [
      {label: 'Month Submitted', value: 'month-submitted', grouper: new ApplicationSubmittedDateGrouper()},
      {label: 'Status', value: 'status', grouper: new ApplicationStatusGrouper()},
      {label: 'Assigned Committee Member', value: 'assigned', grouper: new ApplicationAssignedGrouper()}
    ];

    this.orderOptions = [
      {label: 'Application ID (Ascending)', value: 'application-id-asc', orderBy: new ApplicationIDOrder(true), default: true},
      {label: 'Application ID (Descending)', value: 'application-id-desc', orderBy: new ApplicationIDOrder(false)},
      {label: 'Updated (Ascending)', value: 'application-updated-asc', orderBy: new LastUpdatedOrder(true)},
      {label: 'Updated (Descending)', value: 'application-updated-desc', orderBy: new LastUpdatedOrder(false)}
    ]
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.permissions) {
      this.permissions = changes.permissions.currentValue;
      this.getApplications();
    }
  }

  ngAfterViewInit(): void {
    if (this.applicationSearch?.results) {
      this.applicationSearchSubscription = this.applicationSearch.results.subscribe({
        next: (results: ApplicationResponse[]) => this.loadApplicationSearchResults(results),
        error: (e: string) => {
          this.searchError.message = e;
          this.searchError.show();
        }
      });
    }
  }

  @ViewChild('resultsOperator')
  set resultsOperator(resultsOperator: ResultsOperatorComponent) {
    if (resultsOperator) {
      if (this.resetOperations) {
        resultsOperator.reset();
        this.resetOperations = false;
      } else if (!this.ordered) {
        resultsOperator.applyDefault();
      }

      this.cd.detectChanges();
      this._resultsOperator = resultsOperator;
    }
  }

  ngOnDestroy(): void {
    if (this.applicationSearchSubscription) {
      this.applicationSearchSubscription.unsubscribe();
    }
  }

  searchReset(reset: boolean) {
    if (reset) {
      this.applications = undefined;
      this.searchResults = false;
      this.grouped = undefined;
      this.ordered = false;
      this.resetOperations = true;
      this.getApplications();
    }
  }

  loadApplicationSearchResults(results: ApplicationResponse[]) {
    this.searchResults = true;
    this.grouped = undefined;
    this.ordered = false;
    this.applications = results;
  }

  mapStatus(status: string) {
    return resolveStatus(status);
  }

  lastUpdated(lastUpdated: string) {
    return new Date(lastUpdated).toLocaleString();
  }

  refresh() {
    if (this.searchResults) {
      this.applicationSearch.refreshSearch();
    } else {
      this.getApplications();
      this.resetOperations = true;
    }
  }

  getApplications(subscriber?: Partial<Subscriber<ApplicationResponse[]>>) {
    let viewable: boolean;

    if (this.permissions) {
      if (this.permissions.admin) {
        viewable = true;
      } else if (this.permissions.reviewApplication) {
        viewable = false;
      } else {
        viewable = true;
      }

      if (!subscriber) {
        subscriber = {
          next: response => {
            this.applications = response;
            this.unorderedApplications = this.applications;
            this.grouped = undefined;
            this.unorderGrouped = undefined;
          }
        }
      };

      this.applicationService.getUserApplications(viewable).pipe(
        catchError(e => {
          this.error.emit(e);
          return of();
        })
      )
      .subscribe(subscriber);
    }
  }

  doGroup(groupBy: GroupBy<ApplicationResponse>) {
    if (!this.applications) {
      this.getApplications({
        next: response => {
          this.applications = response;
          this.doGroup(groupBy);
        }
      });
    } else {
      if (!groupBy) {
        this.grouped = undefined;
      } else {
        const grouped = groupBy.group(this.applications);
        const sort = new ApplicationIDOrder(true);
        Object.keys(grouped.grouped).forEach(key => grouped.grouped[key] = sort.order(grouped.grouped[key]) as ApplicationResponse[]);
        this.grouped = groupBy.group(this.applications);
        this.unorderGrouped = this.grouped;
      }
    }
  }

  doOrder(orderBy: OrderBy<ApplicationResponse>) {
    if (!this.unorderGrouped && this.grouped)
      this.unorderGrouped = this.grouped;

    if (!this.applications) {
      this.getApplications({
        next: response => {
          this.applications = response;
          this.doOrder(orderBy);
        }
      });
    } else {
      if (!orderBy) {
        if (this.grouped) {
          this.grouped = this.unorderGrouped;
        } else {
          this.applications = this.unorderedApplications;
        }
      } else {
        this.ordered = true;

        if (this.grouped) {
          this.grouped = orderBy.order(this.grouped) as Grouped<ApplicationResponse>;
        } else {
          this.applications = orderBy.order(this.applications) as ApplicationResponse[];
        }
      }
    }
  }
}
