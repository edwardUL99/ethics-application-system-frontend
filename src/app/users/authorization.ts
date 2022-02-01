/**
 * This class represents a base authorization object
 */
export class Authorization {
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
     * Construct an instance
     * @param id the id of the authorization object
     * @param name the name of the authorization object
     * @param description the description of the object
     */
    constructor(id: number, name: string, description: string) {
        this.id = id;
        this.name = name;
        this.description = description;
    }
}