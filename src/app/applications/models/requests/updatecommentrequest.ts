import { RequestComment } from './reviewapplicationrequest';

/**
 * This class requests that a comment is updated. It must only update top-level
 * parent comments as that is what the API expects
 */
export class UpdateCommentRequest {
  /**
   * Create a request
   * @param id the id of the application to update
   * @param updated the updated comment
   * @param deleteComment true to delete the comment instead of updating it
   */
  constructor(public id: string, public updated: RequestComment, public deleteComment: boolean) {}
}