import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GroupBy, Grouper, GroupOption, OrderBy, OrderOption } from '../grouping';
import { Query, SearchControl, SearchQueries, SearchQuery, Queries } from '../searchcomponent';

/**
 * Map of registered groupers
 */
type RegisteredGroupers = {
  [key: string]: Grouper<any>;
};

/**
 * Map of registered order bys
 */
type RegisteredOrderers = {
  [key: string]: OrderBy<any>;
}

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
   * If the search is to enable grouping, the groupOptions array can be passed in
   */
  @Input() groupOptions: GroupOption[];
  /**
   * If the search is to enable ordering, the options can be passed in here
   */
  @Input() orderOptions: OrderOption[];
  /**
   * The selected group option
   */
  selectedGroup: GroupOption;
  /**
   * The selected order by option
   */
  selectedOrder: OrderOption;
  /**
   * Map of registered groupers
   */
  private groupers: RegisteredGroupers = {};
  /**
   * Map of registered order bys
   */
  private orderers: RegisteredOrderers = {};
  /**
   * A default order if specified
   */
  private defaultOrder: OrderOption;
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
   * Emits that a grouping of results is requested
   */
  @Output() groupRequested: EventEmitter<GroupBy<any>> = new EventEmitter<GroupBy<any>>();
  /**
   * Emitted when an order by is requested
   */
  @Output() orderRequested: EventEmitter<OrderBy<any>> = new EventEmitter<OrderBy<any>>();
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
    
    if (this.groupOptions) {
      this.groupOptions.forEach(option => {
        this.groupers[option.value] = option.grouper;
      })
    }

    if (this.orderOptions) {
      this.orderOptions.forEach(option => {
        this.orderers[option.value] = option.orderBy;

        if (option.default) {
          this.defaultOrder = option;
        }
      });
    }
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
    this.selectedGroup = undefined;
    this.selectedOrder = undefined;
    this.searchPressed.emit((this.currentQuery) ? this.currentQuery.constructQuery() : undefined);
    this.getDefaultOrdering();
  }

  getDefaultOrdering() {
    if (this.defaultOrder) {
      this.orderByChosen(this.defaultOrder);
    }
  }

  private resetValue() {
    const queries = this.queries.map(spec => spec.query);
    const index = queries.indexOf(this.currentQuery);

    this.form.get('query').setValue(this.queries[index].value);
  }

  doReset() {
    this.form.reset();
    this.selectedGroup = undefined;
    this.resetValue();
    this.reset.emit(true);
  }

  groupByChosen(option: GroupOption) {
    if (option == undefined) {
      this.groupRequested.emit(undefined);
      this.selectedGroup = undefined;
    } else {
      const groupBy = new GroupBy(this.groupers[option.value]);
      this.groupRequested.emit(groupBy);
      this.selectedGroup = option;
    }

    if (this.selectedOrder) {
      this.orderByChosen(this.selectedOrder);
    }
  }

  orderByChosen(option: OrderOption) {
    if (option == undefined) {
      this.orderRequested.emit(undefined);
      this.selectedOrder = undefined;
    } else {
      const orderBy = this.orderers[option.value];
      this.orderRequested.emit(orderBy);
      this.selectedOrder = option;
    }
  }
}
