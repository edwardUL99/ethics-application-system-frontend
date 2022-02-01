/**
 * This class represents a request to update the user's role
 */
export class UpdateRoleRequest {
    /**
     * The username of the user to update the role of
     */
    username: string;
    /**
     * The ID of the role being updated to
     */
    role: number;

    /**
     * Construct an update role request instance
     * @param username the username of the user to update the role of
     * @param role the ID of the role being updated to
     */
    constructor(username: string, role: number) {
        this.username = username;
        this.role = role;
    }
}