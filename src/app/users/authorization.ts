/**
 * This class represents a base authorization object
 */
export abstract class Authorization {
    /**
     * The ID of the authorization
     */
    id: number;
    /**
     * The name of the authorization
     */
    name: string;
    /**
     * The description of the authorization
     */
    description: string;
    /**
     * The "tag" given to programatically access the permissions
     */
    tag: string;

    /**
     * Construct an instance
     * @param id the id of the authorization object
     * @param name the name of the authorization object
     * @param description the description of the object
     * @param tag the tag given to this authorization
     */
    constructor(id: number, name: string, description: string, tag: string) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.tag = tag;
    }

    /**
     * Checks if this authorization is equal to the provided one. It should check the types and if not
     * the same instance, return false
     * @param other the other authorization
     */
    abstract equals(other: Authorization): boolean;
}