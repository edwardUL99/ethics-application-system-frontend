/**
 * This file provides na interface and classes that represent a posible value that can
 * be returned by a QuestionViewComponent. Allows matching based on a single value provided
 */

/**
 * This enum represents the type of the value type returned
 */
export enum ValueTypes {
  STRING = 'string',
  OBJECT = 'object',
  ARRAY = 'array'
}

/**
 * This interface represents a value type to be returned by a question view component
 */
export interface ValueType {
  /**
   * The type of the value
   */
  type: ValueTypes;

  /**
   * A value can be matched wholely (i.e. the whole value must match) or else it can be matched
   * loosely, where the value provided can solely be contained within the value type. For example with
   * a checkbox question, the value provided can be just "present" in the returned value to be matched
   * @param value the value to "match"
   */
  matches(value: string): boolean;
}

/**
 * This class represents a string value type that is used when a single return value is required
 */
export class StringValueType implements ValueType {
  readonly type = ValueTypes.STRING;

  constructor(public value: string) { }

  matches(value: string): boolean {
    return this.value == value;
  }
}

/**
 * A value type that holds a value of type Object (i.e. key values). It matches a value based on if there exists
 * a key-value pair that the value matches the provided value
 */
export class ObjectValueType implements ValueType {
  readonly type = ValueTypes.OBJECT;

  constructor(public value: Object) { }

  matches(value: string): boolean {
    let found: boolean = false;

    for (let key of Object.keys(this.value)) {
      found = this.value[key] == value;

      if (found) {
        break;
      }
    }

    return found;
  }
}

/**
 * A value type that contains an array and matches if the array contains the provided value
 */
export class ArrayValueType implements ValueType {
  readonly type = ValueTypes.ARRAY;

  constructor(public value: string[]) { }

  matches(value: string): boolean {
    return this.value.indexOf(value) != -1;
  }
}