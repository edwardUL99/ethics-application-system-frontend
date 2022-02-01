/**
 * This class represents a request to confirm an account
 */
export class ConfirmationRequest {
    /**
     * The email of the user making the confirmation request
     */
    email: string;
    /**
     * The confirmation token
     */
    token: string;

    /**
     * Create an instance
     * @param email the email of the user being confirmed
     * @param token the token used for confirmation
     */
    constructor(email: string, token: string) {
        this.email = email;
        this.token = token;
    }
}