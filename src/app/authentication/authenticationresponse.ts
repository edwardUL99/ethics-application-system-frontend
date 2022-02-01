import { BaseResponse } from '../baseresponse';

/**
 * This interface represents a response to an authentication request
 */
export interface AuthenticationResponse extends BaseResponse {
    /**
     * The username of the authenticated account
     */
    username: string;
    /**
     * The token returned by the authentication
     */
    token: string;
    /**
     * The date at which the authentication is due to expire
     */
    expiry: string;
}