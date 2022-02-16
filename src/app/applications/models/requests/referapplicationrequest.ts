/**
 * This class represents a request to refer an application back to the applicant
 */
export class ReferApplicationRequest {
  /**
   * Create a request object
   * @param id the application ID
   * @param editableFields the list of fields that the applicant has to review
   * @param referrer the username of the committee member that referred the application
   */
  constructor(public id: string, public editableFields: string[], public referrer: string) {}
}