import { KeyValue } from '@angular/common';

/**
 * A function that is used to compare Grouped keys
 */
export type GroupSort = (a: string, b: string) => number;

/**
 * This interface represents an object that can take an object of type T and return the group key for it
 */
export interface Grouper<T> {
  /**
   * Get the group key for the given value. Return undefined if the value should be excluded from
   * grouping
   * @param value the value to get the group key for
   * @returns the key or an array of keys. If an array of keys, the application will be added to the list for each key
   */
  getGroup(value: T): string | string[];

  /**
   * Get the group sort function to pass into angulars keyvalue
   */
  getGroupSort?(): GroupSort;
}

/**
 * Represents a type of group options that has label, value and the Grouper to use
 */
export interface GroupOption {
  /**
   * The label to display
   */
  label: string;
  /**
   * The value to lookup groupers with
   */
  value: string;
  /**
   * The grouper to use
   */
  grouper: Grouper<any>;
}

/**
 * The map of grouped values
 */
export type GroupedValues<T> = {
  [key: string]: T[];
};

export function insertionOrder(a: string, b: string): number {
  return 0;
}

/**
 * The type of the grouped results
 */
export class Grouped<T> {
  /**
   * Construct an instance
   * @param grouped the grouped values
   * @param groupSort the function to sort the groups by in angular's keyvalue pipe. Default is to maintain insertion order
   */
  constructor(public grouped: GroupedValues<T> = {}, public groupSort: GroupSort = insertionOrder) {}

  /**
   * Determines if values exist within the grouped object
   * @returns true if values exist
   */
  hasValues() {
    return Object.keys(this.grouped).length > 0;
  }

  /**
   * Get the sort funtion to pass into Angular's keyvalue pipe
   * @returns the number to use to sort the list
   */
  getSort(): (a: KeyValue<string, T[]>, b: KeyValue<string, T[]>) => number {
    return (a: KeyValue<string, T[]>, b: KeyValue<string, T[]>) => {
      return this.groupSort(a.key, b.key);
    }
  }

  /**
   * Add the value to the grouped values
   * @param groupBy the group by key
   * @param value the value to add to the key
   */
  addValue(groupBy: string, value: T) {
    if (groupBy != undefined || groupBy != null) {
      if (!(groupBy in this.grouped)) {
        this.grouped[groupBy] = [];
      }

      this.grouped[groupBy].push(value);
    }
  }
};

/**
 * This class takes a Grouper and then uses it to get the group key for it and then add it to the list
 * of grouped objects for that ket
 */
export class GroupBy<T> {
  /**
   * Construct a group by instance
   * @param grouper the grouper to generate group by keys with
   */
  constructor(private grouper: Grouper<T>) {}

  /**
   * Group the value into the grouped object
   * @param value the value to group
   * @param grouped the grouped object to add the value to
   */
  private _group(value: T, grouped: Grouped<T>) {
    const group = this.grouper.getGroup(value);

    if (group) {
      if (Array.isArray(group)) {
        group.forEach(g => grouped.addValue(g, value));
      } else {
        grouped.addValue(group, value);
      }
    }
  }

  private _getGroupSort() {
    if (typeof this.grouper.getGroupSort === 'function') {
      return this.grouper.getGroupSort();
    } else {
      return insertionOrder;
    }
  }

  /**
   * Group the values into a Grouped object
   * @param values the values to group
   */
  group(values: T[]): Grouped<T> {
    const grouped = new Grouped<T>({}, this._getGroupSort());
    values.forEach(value => this._group(value, grouped));
    return grouped;
  }
}

/**
 * This interface represents an object that can order a list/group of results
 */
export interface OrderBy<T> {
  /**
   * Order the list/grouped results. If grouped, each individual list should be ordered
   * @param value the value to group
   */
  order(value: T[] | Grouped<T>): T[] | Grouped<T>;
}

/**
 * Represents a configuration option for ordering
 */
export interface OrderOption {
  /**
   * The label to display
   */
  label: string;
  /**
  * The value to lookup order by with
  */
  value: string;
  /**
  * The order by implementation to use
  */
  orderBy: OrderBy<any>;
  /**
   * Determines if this should be a default option to use
   */
  default?: boolean;
}