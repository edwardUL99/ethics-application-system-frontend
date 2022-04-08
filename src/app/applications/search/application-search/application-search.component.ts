import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { SearchEndpoints } from '../../../search/search-endpoints';
import { SearchService } from '../../../search/search.service';
import { Queries, Query, SearchComponent } from '../../../search/searchcomponent';
import { ApplicationResponse } from '../../models/requests/applicationresponse';
import { QUERIES } from '../queries';

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
   * The endpoint to search with
   */
  readonly endpoint: SearchEndpoints = SearchEndpoints.APPLICATIONS;
  /**
   * The queries supported by the component
   */
  queries: Queries = QUERIES;
  /**
   * The last executed search query
   */
  lastSearch: Query;

  constructor(private searchService: SearchService) {}

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
}
