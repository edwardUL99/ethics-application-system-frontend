
/**
 * This class represents a user account in the system
 */
export class Account {
    /**
     * The account's username
     */
    username: string;
    /**
     * The account's e-mail address
     */
    email: string;
    /**
     * The account's password
     */
    password: string;
    /**
     * True if the account is confirmed, false if not
     */
    confirmed: boolean;

    /**
     * Construct an Account object
     * @param username the username of the account
     * @param email the email of the account
     * @param password the password of the account
     * @param confirmed true if the account is confirmed, false if not
     */
    constructor(username: string, email: string, password: string, confirmed: boolean) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.confirmed = confirmed;
    }
}
