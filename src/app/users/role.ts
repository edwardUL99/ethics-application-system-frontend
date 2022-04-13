import { Authorization } from "./authorization";
import { Permission } from "./permission";

/**
 * This class represents a collection of permissions
 */
export class Role extends Authorization {
    /**
     * The set of permissions that belong to this role
     */
    permissions: Permission[];
    /**
     * Indicates if the role is only allowed to be assigned to a single user at a time
     */
    singleUser: boolean;
    /**
     * The tag of the role to downgrade to
     */
    downgradeTo: string;

    /**
     * Construct an instance
     * @param id the id of the authorization object
     * @param name the name of the authorization object
     * @param description the description of the object
     * @param tag the tag given to this authorization
     * @param permissions the array of permissions belonging to this role
     * @param singleUser true if the role is only allowed to be assigned to a single user
     * @param downgradeTo the tag of the role to downgrade to if singleUser is true
     */
    constructor(id: number, name: string, description: string, tag: string, permissions: Permission[], singleUser: boolean, downgradeTo: string) {
        super(id, name, description, tag);
        this.permissions = permissions;
        this.singleUser = singleUser;
        this.downgradeTo = downgradeTo;
    }

    equals(other: Authorization): boolean {
        if (!(other instanceof Role)) {
            return false;
        } else {
            let equals = this.name == other.name && this.description == other.description && this.tag == other.tag
                && this.singleUser;

            if (equals) {
                if (this.permissions.length == other.permissions.length) {
                    const thisValues = Array.from(this.permissions);
                    const otherValues = Array.from(other.permissions);

                    let i: number;
                    for (i = 0; i < this.permissions.length && thisValues[i].equals(otherValues[i]); i++) {}

                    equals = i == this.permissions.length;
                } else {
                    equals = false;
                }
            }

            return equals;
        }
    }
}