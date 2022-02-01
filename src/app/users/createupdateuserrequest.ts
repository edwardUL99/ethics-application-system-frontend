/**
 * This request represents a request to create/update a user profile
 */
export class CreateUpdateUserRequest {
    /**
     * The user's username
     */
    username: string;
    /**
     * The full name of the user
     */
    name: string;
    /**
     * The user's department
     */
    department: string;

    /**
     * Construct an instance
     * @param username the username of the user the profile is being created for
     * @param name the full name of the user
     * @param department the department the user is in
     */
    constructor(username: string, name: string, department: string) {
        this.username = username;
        this.name = name;
        this.department = department;
    }
}