import { Comment } from '../applications/comment';

/**
 * This class represents a request to mark an applciation as review/reviewed
 */
export class ReviewApplicationRequest {
  /**
   * Create a request object
   * @param id The application ID
   * @param finishReview true to finish the review, false to set it in review
   */
  constructor(public id: string, public finishReview: boolean) {}
}

/**
 * This class represents a request to review a submitted application by adding comments to it
 */
export class ReviewSubmittedApplicationRequest {
  /**
   * 
   * @param id the application ID
   * @param comments the comments to add to the application
   */
  constructor(public id: string, public comments: RequestComment[]) {}
}

/**
 * This class represents a simplified comment class for data transfer
 */
export class RequestComment {
  /**
   * Create a RequestComment
   * @param id the database ID of the comment
   * @param username the username of the user that left the comment
   * @param comment the comment text
   * @param componentId the componentID the comment is attached to
   * @param subComments the comments left on this comment
   * @param createdAt the timestamp in ISO format of when the comment was created
   */
  constructor(public id: number, public username: string, public comment: string, public componentId: string, public subComments: RequestComment[], public createdAt: string) {}
}

/**
 * Map the comment to a request comment
 */
export function mapCommentToRequest(comment: Comment): RequestComment {
  const request: RequestComment = {
    id: comment.id,
    username: comment.username,
    comment: comment.comment,
    componentId: comment.componentId,
    subComments: [],
    createdAt: comment.createdAt.toISOString()
  };

  for (let sub of comment.subComments) {
    request.subComments.push(mapCommentToRequest(sub));
  }

  return request;
}