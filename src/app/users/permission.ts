import { Authorization } from "./authorization";

/**
 * This class represents a permission a user can have
 */
export class Permission extends Authorization {
    /**
     * Construct an instance
     * @param id the id of the authorization object
     * @param name the name of the authorization object
     * @param description the description of the object
     * @param tag the tag given to this authorization
     */
    constructor(id: number, name: string, description: string, tag: string) {
        super(id, name, description, tag);
    }

    equals(other: Authorization): boolean {
        if (!(other instanceof Permission)) {
            return false;
        } else {
            return this.name == other.name && this.description == other.description && this.tag == other.tag;
        }
    }
}