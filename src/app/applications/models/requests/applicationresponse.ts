import { BaseResponse } from '../../../baseresponse';
import { ApplicationStatus } from '../applications/applicationstatus';
import { AnswerShape, ApplicationCommentsShape, AssignedCommitteeMemberResponse, AttachedFileShape, CommentShape } from './shapes';

/**
 * The mapping of componentID to the answer shape
 */
export type AnswersMapping = {
  [key: string]: AnswerShape
}

/**
 * This interface represents the base interface for all application responses
 */
export interface ApplicationResponse extends BaseResponse {
  /**
   * The database ID of the application
   */
  dbId?: number;
  /**
   * The application ID
   */
  id: string;
  /**
   * The username of the user that created the application
   */
  username: string;
  /**
   * The status of the application
   */
  status: ApplicationStatus;
  /**
   * The ID of the template that the application was answered on
   */
  templateId: number;
  /**
   * The mapping of answers contained within this application response
   */
  answers: AnswersMapping;
  /**
   * The last Updated time as a string timestamp
   */
  lastUpdated: string;
  /**
   * The map of files attached to the application
   */
  attachedFiles: AttachedFileShape[];
}

/**
 * This interface represents a response representing a draft application
 */
export interface DraftApplicationResponse extends ApplicationResponse {}

/**
 * The mapping of component IDs to the comment shapes
 */
export type CommentsMapping = {
  [key: string]: ApplicationCommentsShape;
}

/**
 * This interface represents a response representing a submitted/resubmitted application
 */
export interface SubmittedApplicationResponse extends ApplicationResponse {
  /**
   * The map of comments left on the application
   */
  comments: CommentsMapping;
  /**
   * The list of assigned committee members usernames
   */
  assignedCommitteeMembers: AssignedCommitteeMemberResponse[];
  /**
   * The final comment left on the application
   */
  finalComment: CommentShape;
  /**
   * An optional value of previous committee members
   */
  previousCommitteeMembers?: string[];
  /**
   * The time the application was submitted at
   */ 
  submittedTime: string;
  /**
   * The timestamp of when the application was approved
   */
  approvalTime: string;
}

/**
 * This interface represents a response representing an application that has been referred
 */
export interface ReferredApplicationResponse extends SubmittedApplicationResponse {
  /**
   * The list of field component IDs that can be edited
   */
  editableFields: string[];
  /**
   * The username of the committee member that referred the application
   */
  referredBy: string;
}