import { UserResponseShortened } from '../../../users/responses/userresponseshortened';

/**
 * This interface represents the response after assigning committee members
 */
export interface AssignMembersResponse {
  /**
   * The application ID
   */
  id: string;
  /**
   * The list of assigned committee members
   */
  members: ResponseAssignedCommitteeMember[];
  /**
   * The timestamp of when the application was last updated
   */
  lastUpdated: string;
}

/**
 * The shape of the assigned committee members given in the above
 * response
 */
export interface ResponseAssignedCommitteeMember {
  /**
   * The database ID of the assigned committee member object
   */
  id: number;
  /**
   * The id of the application the user is assigned to
   */
  applicationId: string;
  /**
   * The assigned committee member
   */
  member: UserResponseShortened;
  /**
   * The value to determine if the committee member has finished their review or not
   */
  finishReview: boolean;
}