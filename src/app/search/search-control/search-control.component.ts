import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Query, SearchControl, SearchQueries, SearchQuery, Queries } from '../searchcomponent';

/**
 * A component for rendering search controls. It takes the list of defined queries, and then based on the selected query,
 * parses the constructed SearchControl models from the query and renders them. The constructed query is then emitted when search is pressed
 */
@Component({
  selector: 'app-search-control',
  templateUrl: './search-control.component.html',
  styleUrls: ['./search-control.component.css']
})
export class SearchControlComponent implements OnInit {
  /**
   * The queries to register with the component
   */
  @Input() queries: Queries;
  /**
   * Allow a reset event to be emitted by a reset button should the search allow searches to be reset
   */
  @Input() allowReset: boolean = false;
  /**
   * The form group to store the search form
   */
  form: FormGroup;
  /**
   * The form array to manipulate
   */
  controls: FormArray;
  /**
   * An output event that sends the constructed query when search is pressed
   */
  @Output() searchPressed: EventEmitter<Query> = new EventEmitter<Query>();
  /**
   * If allowReset is true, this is used to emit reset events 
   */
  @Output() reset: EventEmitter<boolean> = new EventEmitter<boolean>();
  /**
   * The mapped search queries
   */
  private mappedSearchQueries: SearchQueries = {}; 
  /**
   * The currently selected search query
   */
  private currentQuery: SearchQuery;
  /**
   * The list of search controls
   */
  searchControls: SearchControl[] = [];

  constructor(private fb: FormBuilder) {
    this.controls = this.fb.array([]);
    this.form = this.fb.group({
      query: this.fb.control('', Validators.required),
      controls: this.controls
    });
  }

  ngOnInit(): void {
    this.queries.forEach(q => this.mappedSearchQueries[q.value] = q.query);
    this.onQueryChange({target: {value: this.queries[0].value}});
    this.form.get('query').setValue(this.queries[0].value);
  }

  onQueryChange(event: any) {
    const value = event.target.value;

    if (value == '') {
      this.controls.clear();
      this.searchControls = [];
    } else if (value in this.mappedSearchQueries) {
      const searchQuery = this.mappedSearchQueries[value];
      this.controls.clear();
      const searchControls = searchQuery.createControls(this.fb);
      searchControls.forEach(c => this.controls.push(c.control));
      this.searchControls = searchControls;
      this.currentQuery = searchQuery;
    }
  }

  search() {
    this.searchPressed.emit((this.currentQuery) ? this.currentQuery.constructQuery() : undefined);
  }

  private resetValue() {
    const queries = this.queries.map(spec => spec.query);
    const index = queries.indexOf(this.currentQuery);

    this.form.get('query').setValue(this.queries[index].value);
  }

  doReset() {
    this.form.reset();
    this.resetValue();
    this.reset.emit(true);
  }
}
