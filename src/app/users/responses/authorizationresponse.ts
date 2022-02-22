import { BaseResponse } from "../../baseresponse";

/**
 * This interface represents a base authorization response object
 */
export interface AuthorizationResponse extends BaseResponse {
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
     * The tag given to the authorization
     */
    tag: string;
}