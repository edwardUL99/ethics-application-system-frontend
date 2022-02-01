import { Account } from './account';

/**
 * This class represents an account that has been authenticated by the authentication
 */
export class AuthenticatedAccount extends Account {
    /**
     * The JWT token the account is authenticated with
     */
    jwtToken: string;
    /**
     * The expiration date of the account
     */
    expiration: Date;

    /**
     * Construct an AuthenticatedAccount object
     * @param username the username of the account
     * @param email the email of the account
     * @param jwtToken: the token used for authentication
     * @param expiration: the expiration datetime
     */
    constructor(username: string, email: string, jwtToken: string, expiration: Date) {
        super(username, email, null, true);
        this.jwtToken = jwtToken;
        this.expiration = expiration;
    }

    /**
     * Determines if the authenticated account's authentication has expired
     */
    isExpired(): boolean {
        return this.expiration < new Date();  
    }
}