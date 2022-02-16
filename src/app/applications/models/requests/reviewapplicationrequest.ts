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
   * 
   * @param id the database ID of the comment
   * @param username the username of the user that left the comment
   * @param comment the comment text
   * @param componentId the componentID the comment is attached to
   * @param subComments the comments left on this comment
   */
  constructor(public id: number, public username: string, public comment: string, public componentId: string, public subComments: RequestComment[]) {}
}