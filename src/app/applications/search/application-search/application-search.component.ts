import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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
  @Output() results: EventEmitter<ApplicationResponse[]>;
  /**
   * The endpoint to search with
   */
  readonly endpoint: SearchEndpoints = SearchEndpoints.APPLICATIONS;
  /**
   * The queries supported by the component
   */
  queries: Queries = QUERIES;

  constructor(private searchService: SearchService) {}

  ngOnInit(): void {}

  search(query: Query): void {
    console.log(query);
  }
}
