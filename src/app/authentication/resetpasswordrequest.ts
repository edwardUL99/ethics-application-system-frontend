/**
 * This class represents a request to reset a password
 */
export class ResetPasswordRequest {
  /**
   * Create a request
   * @param username the username of the account
   * @param token the reset password token
   * @param password the new password
   */
  constructor(public username: string, public token: string, public password: string) {}
}