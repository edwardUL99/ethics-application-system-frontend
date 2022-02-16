/**
 * The type of value contained within the answer
 */
export enum ValueType {
  /**
   * A text answer
   */
  TEXT = "TEXT",
  /**
   * A number answer
   */
  NUMBER = "NUMBER",
  /**
   * An answer that has one or more options selected
   */
  OPTIONS = "OPTIONS"
}

/**
 * This class represents an answer found on an application
 */
export class Answer {
  /**
   * Construct an answer instance with the given fields
   * @param id the database ID of the answer
   * @param componentId the component ID the answer is associated with
   * @param value the value of the answer
   * @param valueType the type of the answer
   */
  constructor(public id: number, componentId: string, value: string, valueType: ValueType) {}
}