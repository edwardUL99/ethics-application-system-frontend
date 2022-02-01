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
     */
     constructor(id: number, name: string, description: string) {
        super(id, name, description);
    }
}