/**
 * THis class represents a request for a committee chair/admin to accept an application that has been resubmitted
 * and assign it to committee members
 */
export class AcceptResubmittedRequest {
  /**
   * Create a request instance
   * @param id the application ID
   * @param committeeMembers the list of committee member usernames to assign to the application
   */
  constructor(public id: string, public committeeMembers: string[]) {}
}