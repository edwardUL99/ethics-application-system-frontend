import { AuthorizationResponse } from "./authorizationresponse";
import { PermissionResponse } from "./permissionresponse";

/**
 * This interface represents a response outlining a role
 */
export interface RoleResponse extends AuthorizationResponse {
    /**
     * The set of permissions that belong to this role
     */
    permissions: PermissionResponse[];
    /**
     * Indicates if the role is only allowed to be assigned to a single user at a time
     */
    singleUser: boolean;
    /**
     * The tag of the role to downgrade the user to
     */
    downgradeTo: string;
}