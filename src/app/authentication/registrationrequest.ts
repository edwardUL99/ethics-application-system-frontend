/**
 * This class represents a request to register for an account
 */
export class RegistrationRequest {
    /**
     * The username to register
     */
    username: string;
    /**
     * The email to register
     */
    email: string;
    /**
     * The password to register for the account
     */
    password: string;
    /**
     * A key to send with the request which, if correct, will result in the account being automatically confirmed
     */
    confirmationKey: string;

    /**
     * Construct a Registrationrequest
     * @param username the username to register
     * @param email the email to register
     * @param password the password to register for the account
     * @param confirmationKey the key to send to automatically confirm this account if valid
     */
    constructor(username: string, email: string, password: string, confirmationKey: string) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.confirmationKey = confirmationKey;
    }
}