import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { catchError, Observable, of, Subscription } from 'rxjs';
import { AlertComponent } from '../../../alert/alert.component';
import { ApplicationService } from '../../application.service';
import { ApplicationResponse } from '../../models/requests/applicationresponse';
import { resolveStatus } from '../../models/requests/mapping/applicationmapper';
import { UserPermissions } from '../../userpermissions';
import { ApplicationSearchComponent } from '../application-search/application-search.component';

@Component({
  selector: 'app-application-results',
  templateUrl: './application-results.component.html',
  styleUrls: ['./application-results.component.css']
})
export class ApplicationResultsComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  /**
   * The applications subscription
   */
  applications: Observable<ApplicationResponse[]>;

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
      this.applications = this.getApplications();
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

  loadApplicationSearchResults(results: ApplicationResponse[]) {
    this.applications = new Observable<ApplicationResponse[]>(observer => {
      observer.next(results);
      observer.complete();
    });
  }

  mapStatus(status: string) {
    return resolveStatus(status);
  }

  lastUpdated(lastUpdated: string) {
    return new Date(lastUpdated).toLocaleString();
  }

  getApplications(): Observable<ApplicationResponse[]> {
    let viewable: boolean;

    if (this.permissions) {
      if (this.permissions.admin) {
        viewable = true;
      } else if (this.permissions.reviewApplication) {
        viewable = false;
      } else {
        viewable = true;
      }

      return this.applicationService.getUserApplications(viewable).pipe(
        catchError(e => {
          this.error.emit(e);
          return of();
        })
      );
    }
  }
}