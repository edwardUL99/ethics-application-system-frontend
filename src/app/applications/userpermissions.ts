/**
 * An interface representing the different permissions the user viewing the applications page
 */
export interface UserPermissions {
  /**
   * Determines if the user can create an application
   */
  createApplication: boolean;
  /**
   * Determines if the user can review an application
   */
  reviewApplication: boolean;
  /**
   * Determines if the user has an admin permission
   */
  admin: boolean;
}