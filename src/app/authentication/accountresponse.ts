import { BaseResponse } from '../baseresponse';

/**
 * This interface represents a response to an account request
 */
export interface AccountResponse extends BaseResponse {
    /**
     * The username of the account
     */
    username: string;
    /**
     * The account email
     */
    email: string;
    /**
     * True if the account is confirmed, false if not
     */
    confirmed: boolean;
}