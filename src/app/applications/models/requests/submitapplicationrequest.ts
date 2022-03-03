/**
 * This class represents a request to submit a draft/referred application. This should be done after saving the
 * final version of the draft
 */
export class SubmitApplicationRequest {
  /**
   * Create the submit application request
   * @param id the application ID
   */
  constructor(public id: string) {}
}