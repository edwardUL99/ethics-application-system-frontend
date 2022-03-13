import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { shortResponseToUserMapper, UserResponseShortened } from '../../responses/userresponseshortened';
import { User } from '../../user';
import { UserSearchComponent } from '../user-search/user-search.component';

@Component({
  selector: 'app-user-search-page',
  templateUrl: './user-search-page.component.html',
  styleUrls: ['./user-search-page.component.css']
})
export class UserSearchPageComponent implements OnInit, AfterViewInit, OnDestroy {
  /**
   * The component to use for search
   */
  @ViewChild('userSearch')
  userSearch: UserSearchComponent;
  /**
   * The list of loaded user results;
   */
  @Input() users: User[];
  /**
   * The Subscription to user results
   */
  resultsSubscription: Subscription;
  /**
   * An error that may have occurred performing search
   */
  error: string;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.resultsSubscription = this.userSearch.results.subscribe({
      next: (results: UserResponseShortened[]) => this.loadResults(results),
      error: (e: string) => this.error = e
    });
  }

  ngOnDestroy(): void {
    if (this.resultsSubscription) {
      this.resultsSubscription.unsubscribe();
    }
  }

  private loadResults(results: UserResponseShortened[]) {
    this.users = results.map(r => shortResponseToUserMapper(r));
  }
}
