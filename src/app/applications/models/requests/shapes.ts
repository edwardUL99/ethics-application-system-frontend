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
  /**
   * The timestamp of when the comment was created
   */
  createdAt: string;
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

/**
 * This class represents the shape of the assigned committee member response
 * received from the server
 */
export interface AssignedCommitteeMemberResponse {
  /**
   * The database ID of the object
   */
  id: number;
  /**
   * The ID of the application the user is assigned to
   */
  applicationId: string;
  /**
   * The username of the assigned committee member
   */
  username: string;
  /**
   * True if the committee member has finished their review
   */
  finishReview: boolean;
}