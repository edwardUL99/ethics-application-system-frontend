import { Comment } from '../applications/comment';

/**
 * This class represents a request to approve/reject an application
 */
export class ApproveApplicationRequest {
  /**
   * Create a request instance
   * @param id the id of the application
   * @param approve true to approve the application, false to reject it
   * @param finalComment the final comment to leave on the application after approving it
   */
  constructor(public id: string, public approve: boolean, public finalComment: Comment) {}
}