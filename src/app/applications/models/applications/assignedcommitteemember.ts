import { User } from '../../../users/user';

/**
 * This class represents an assigned committee member object
 */
export class AssignedCommitteeMember {
  /**
   * Create a member instance
   * @param id the database ID of the assigned committee member instance
   * @param applicationId the ID of the application the committee member is assigned to
   * @param user the user object that represents the committee member
   * @param finishReview true if the committee member has finished their review, false if not
   */
  constructor(public id: number, public applicationId: string, public user: User, public finishReview: boolean) {}
}