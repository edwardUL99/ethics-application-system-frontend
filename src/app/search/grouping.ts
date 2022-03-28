import { KeyValue } from '@angular/common';

/**
 * A function that can be passed into angular's keyvalue pipe
 */
export type GroupSort<T> = (a: KeyValue<string, T[]>, b: KeyValue<string, T[]>) => number;

/**
 * This interface represents an object that can take an object of type T and return the group key for it
 */
export interface Grouper<T> {
  /**
   * Get the group key for the given value. Return undefined if the value should be excluded from
   * grouping
   * @param value the value to get the group key for
   */
  getGroup(value: T): string;

  /**
   * Get the group sort function to pass into angulars keyvalue
   */
  getGroupSort?(): GroupSort<T>;
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

export function insertionOrder<T>(a: KeyValue<string, T[]>, b: KeyValue<string, T[]>): number {
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
  constructor(public grouped: GroupedValues<T> = {}, public groupSort: GroupSort<T> = insertionOrder) {}

  /**
   * Determines if values exist within the grouped object
   * @returns true if values exist
   */
  hasValues() {
    return Object.keys(this.grouped).length > 0;
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
    grouped.addValue(this.grouper.getGroup(value), value);
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