import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { catchError, of, Subscriber, Subscription } from 'rxjs';
import { AlertComponent } from '../../../alert/alert.component';
import { GroupBy, Grouped, OrderBy } from '../../../search/grouping';
import { ApplicationService } from '../../application.service';
import { ApplicationResponse } from '../../models/requests/applicationresponse';
import { resolveStatus } from '../../models/requests/mapping/applicationmapper';
import { UserPermissions } from '../../userpermissions';
import { ApplicationSearchComponent } from '../application-search/application-search.component';
import { ApplicationIDOrder } from '../sort';

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
   * A flag to indicate that listed applications are from a search result
   */
  private searchResults: boolean;

  /**
   * Emits when an unknown error occurs
   */
  @Output() error: EventEmitter<any> = new EventEmitter<any>();

  /**
   * Subscription to the application search
   */
  private applicationSearchSubscription: Subscription;

  constructor(private applicationService: ApplicationService) { }

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

  ngOnDestroy(): void {
    if (this.applicationSearchSubscription) {
      this.applicationSearchSubscription.unsubscribe();
    }
  }

  searchReset(reset: boolean) {
    if (reset) {
      this.searchResults = false;
      this.grouped = undefined;
      this.getApplications();
    }
  }

  loadApplicationSearchResults(results: ApplicationResponse[]) {
    this.searchResults = true;
    this.grouped = undefined;
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
            this.applications = new ApplicationIDOrder(true).order(response) as ApplicationResponse[];
            this.unorderedApplications = this.applications;
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
        if (this.grouped) {
          this.grouped = orderBy.order(this.grouped) as Grouped<ApplicationResponse>;
        } else {
          this.applications = orderBy.order(this.applications) as ApplicationResponse[];
        }
      }
    }
  }
}
