/**
 * This class represents a request to update the user's account
 */
export class UpdateAccountRequest {
  /**
   * Create the request
   * @param username the username of the account
   * @param password the password of the account
   */
  constructor(public username: string, public password: string) {}
}