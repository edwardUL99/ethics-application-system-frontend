import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SearchEndpoints } from '../../../search/search-endpoints';
import { SearchService } from '../../../search/search.service';
import { Queries, Query, SearchComponent } from '../../../search/searchcomponent';
import { UserResponseShortened } from '../../responses/userresponseshortened';
import { createBaseQueries } from '../queries';
import { UserQueryService } from '../user-query.service';

@Component({
  selector: 'app-user-search',
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.css']
})
export class UserSearchComponent implements OnInit, SearchComponent<UserResponseShortened> {
  /**
   * The queries to pass into the search control component
   */
  queries: Queries;
  /**
   * The endpoint for sending searches to
   */
  endpoint: SearchEndpoints = SearchEndpoints.USERS;
  /**
   * The results event emitter
   */
  @Output() results: EventEmitter<UserResponseShortened[]> = new EventEmitter<UserResponseShortened[]>();

  constructor(private queryService: UserQueryService, 
    private searchService: SearchService) { }

  ngOnInit(): void {
    this.loadQueries();
  }

  private loadQueries() {
    const defaultQueries = createBaseQueries();

    this.queryService.getQueries()
      .subscribe({
        next: queries => this.queries = queries,
        error: e => {
          console.error(e);
          this.queries = defaultQueries
        }
      });
  }

  search(query: Query): void {
    this.searchService.search<UserResponseShortened>(this.endpoint, query.query, query.or)
      .subscribe({
        next: response => this.results.emit(response.results),
        error: e => this.results.error(e)
      });
  }
}
