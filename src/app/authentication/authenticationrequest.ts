/**
 * This class represents a request for authentication
 */
export class AuthenticationRequest {
    /**
     * The username of the account being authenticated
     */
    username: string;
    /**
     * The password to check for authentication
     */
    password: string;
    /**
     * True if the username should be treated as an email, false if username
     */
    email: boolean;
    /**
     * The number of hours the authentication should expire in
     */
    expiry: number;

    /**
     * Construct an authentication request
     * @param username the username of the account to authenticate
     * @param password the password to check for authentication
     * @param email true if the username should be treated as an email
     * @param expiry the number of hours the authentication should expire in
     */
    constructor(username: string, password: string, email: boolean, expiry: number) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.expiry = expiry;
    }
}