/**
 * This class represents a comment left on an application
 */
export class Comment {
  /**
   * Construct a comment instance
   * @param id the ID of the comment
   * @param username the username of the user that made the comment
   * @param comment the comment text
   * @param componentId the componentID the comment is attached to
   * @param subComments the list of sub comments on this comment
   * @param createdAt the timestam of when the comment was created
   */
  constructor(public id: number, public username: string, public comment: string,
    public componentId: string, public subComments: Comment[], public createdAt: Date) {}
}

/**
 * This class represents the list of comments left on an application component
 */
export class ApplicationComments {
  /**
   * Create an application comments instance
   * @param id the database ID of the object
   * @param componentId the ID of the component the comments are left on
   * @param comments the comments left
   */
  constructor(public id: number, public componentId: string, public comments: Comment[]) {}
}