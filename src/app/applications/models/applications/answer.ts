import { User } from '../../../users/user';

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
   * An answer that has one or more options selected. Can be set as value=label. If = not included
   * value is just displayed
   */
  OPTIONS = "OPTIONS",
  /**
   * An answer in image base64 encoded format
   */
  IMAGE = "IMAGE"
}

/**
 * An interface for matching answer values against a given value
 */
interface AnswerMatcher {
  /**
   * Match the answer
   * @param provided The provided value
   * @param value the value of the answer
   */
  match(provided: string, value: string): boolean;
  /**
   * Determine if the value is "empty"
   */
  empty(provided: string): boolean;
}

/**
 * A matcher to match any "string" answer type
 */
class StringMatcher implements AnswerMatcher {
  match(provided: string, value: string): boolean {
    return provided == value;
  }

  empty(provided: string): boolean {
    return provided == undefined || provided == '';
  }
}

/**
 * A matcher that matches if the provided value matches at least one provided comma-separated option.
 * If options are mapped like value=label, the value is matched`
 */
class OptionsMatcher implements AnswerMatcher {
  private getOptions(value: string) {
    return value.split(',').map(s => (s.includes('=')) ? s.split('=')[1] : s);
  }

  match(provided: string, value: string): boolean {
    if (value) {
      const options = this.getOptions(value);

      return options.indexOf(provided) != -1;
    } else {
      return false;
    }
  }

  empty(provided: string): boolean {
    return !provided || this.getOptions(provided).length == 0;
  }
}

/**
 * Mapping for matchers
 */
export type Matchers = {
  [key in ValueType]?: AnswerMatcher;
}

/**
 * Our registered matchers
 */
const _matchers: Matchers = {};

_matchers[ValueType.TEXT] = new StringMatcher();
_matchers[ValueType.NUMBER] = new StringMatcher();
_matchers[ValueType.IMAGE] = new StringMatcher();
_matchers[ValueType.OPTIONS] = new OptionsMatcher();

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
   * @param user another user that made this answer
   */
  constructor(public id: number = undefined, public componentId: string, public value: string, public valueType: ValueType, public user: User) {}

  /**
   * A value can be matched wholely (i.e. the whole value must match) or else it can be matched
   * loosely, where the value provided can solely be contained within the value type. For example with
   * a checkbox question, the value provided can be just "present" in the returned value to be matched
   * @param value the value to "match"
   */
  matches(value: string): boolean {
    return _matchers[this.valueType].match(value, this.value);
  }

  /**
   * Determine if the answer is considered empty based on the value type
   */
  empty(): boolean {
    return _matchers[this.valueType].empty(this.value);
  }
}