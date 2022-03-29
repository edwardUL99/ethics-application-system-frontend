import { EventEmitter } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { SearchEndpoints } from './search-endpoints';
import { GroupBy } from '../search/grouping';

/**
 * This interface represents a component that holds a SearchControlComponent and can consume the query from that component, search
 * with the query and then emit the results. The interface mandates the queries the search control component should display are defined
 * with the queries attribute
 */
export interface SearchComponent<T> {
  /**
   * The endpoint that this search component calls to perform the search
   */
  endpoint: SearchEndpoints;
  /**
   * The list of query definitions for SearchQueryImplementations to pass into the the SearchControlComponent
   */
  queries: Queries;
  /**
   * The emitter to emit the events to the parent component
   */
  results: EventEmitter<T[]>;
  /**
   * When a group by is requested, this emits the group by object that the client can use to group a list of already retrieved applications
   */
  groupBy?: EventEmitter<GroupBy<T>>;

  /**
   * This method takes a Query constructed from the search and sends the search request, emitting the results
   */
  search(query: Query): void;
}

/**
 * A query constructed from the constructQuery method of SearchComponent
 */
export class Query {
  /**
   * Construct a Query instance
   * @param query the query string
   * @param or true to OR the results, false to AND them if the query represents more than one criteria
   */
  constructor(public query: string, public or: boolean = false) {}
}

/**
 * If the search control represents a select, this holds the options
 */
export interface SearchControlOption {
  /**
   * The select value
   */
  value: string;
  /**
   * The select label
   */
  label: string;
}

/**
 * This class represents a search control
 */
export class SearchControl {
  /**
   * Create a SearchControl
   * @param label the label of the control
   * @param control the form control instance
   * @param type the type of the control if the control is an input
   * @param placeholder the placeholder to display on the control (optional)
   * @param description the optional description for the control
   */
  constructor(public label: string, public control: FormControl, public type: string = 'text', 
    public placeholder: string = '', public description: string = '', public options: SearchControlOption[] = undefined) {}
}

/**
 * This interface represents a query that defines the from controls to display based on
 * the query that will be shown
 */
export interface SearchQuery {
  /**
   * Takes the given form array, clears it and adds the controls for this query to it
   * @param fb the form builder to use to create form controls
   * @returns the constructed search controls
   */
  createControls(fb: FormBuilder): SearchControl[];
  /**
   * Constructs the query 
   */
  constructQuery(): Query;
}

/**
 * A mapping of a search query key to the implementation of the SearchQuery
 */
export type SearchQueries = {
  [key: string]: SearchQuery;
}

/**
 * This interface allows the definition of a query
 */
export interface QuerySpecification {
  /**
   * The query label that tells the user what the query is
   */
  label: string;
  /**
   * The value that is used internally for mapping select value to the current query
   */
  value: string;
  /**
   * The SearchQuery implementation
   */
  query: SearchQuery;
}

/**
 * The Queries type
 */
export type Queries = QuerySpecification[];