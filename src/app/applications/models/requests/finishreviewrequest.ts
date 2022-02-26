/**
 * This class represents a request to finish a review of a committee member
 */
export class FinishReviewRequest {
  /**
   * Create a request object
   * @param id the ID of the application
   * @param member the username of the committee member
   */
  constructor(public id: string, public member: string) {}
}