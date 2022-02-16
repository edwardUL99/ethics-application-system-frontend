/**
 * This file contains many different "shapes" for objects used throughout the responses
 */

import { ValueType } from "../applications/answer";

/**
 * This interface represents the shape of an answer
 */
export interface AnswerShape {
  /**
   * The database ID of the answer
   */
  id: number;
  /**
   * The componentId of the component that the answer is attached to
   */
  componentId: string;
  /**
   * The value of the answer
   */
  value: string;
  /**
   * The type of the value contained within the answer
   */
  valueType: ValueType;
}

/**
 * This interface represents the shape of a comment
 */
export interface CommentShape {
  /**
   * The database ID of the comment
   */
  id: number;
  /**
   * The username of the user that made the comment
   */
  username: string;
  /**
   * The comment content
   */
  comment: string;
  /**
   * The ID of the component the comment is attached to
   */
  componentId: string;
  /**
   * The list of sub comments
   */
  subComments: CommentShape[];
}

/**
 * This interface represents the shape of an attached file
 */
export interface AttachedFileShape {
  /**
   * The database ID of the attached file
   */
  id: number;
  /**
   * The name of the file
   */
  filename: string;
  /**
   * The directory the file is contained in
   */
  directory: string;
  /**
   * The componentID the file is attached to
   */
  componentId: string;
}