import { Authorization } from "./authorization";
import { Permission } from "./permission";

/**
 * This class represents a collection of permissions
 */
export class Role extends Authorization {
    /**
     * The set of permissions that belong to this role
     */
    permissions: Set<Permission>;
    /**
     * Indicates if the role is only allowed to be assigned to a single user at a time
     */
    singleUser: boolean;

    /**
     * Construct an instance
     * @param id the id of the authorization object
     * @param name the name of the authorization object
     * @param description the description of the object
     * @param permissions the array of permissions belonging to this role
     * @param singleUser true if the role is only allowed to be assigned to a single user
     */
     constructor(id: number, name: string, description: string, permissions: Permission[], singleUser: boolean) {
        super(id, name, description);
        this.permissions = new Set(permissions);
        this.singleUser = singleUser;
    }
}