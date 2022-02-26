/**
 * This class represents a request to assign reviewer(s) to the application
 */
export class AssignReviewerRequest {
  /**
   * Construct a request
   * @param id the application ID
   * @param members the list of committee member usernames
   */
  constructor(public id: string, public members: string[]) {}
}