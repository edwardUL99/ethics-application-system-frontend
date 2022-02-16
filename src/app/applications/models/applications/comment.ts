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
   */
  constructor(public id: number, public username: string, public comment: string,
    public componentId: string, public subComments: Comment[]) {}
}