import { BaseResponse } from "../../baseresponse";

/**
 * This response represents a user response that is shortened as it is used in a listing of users
 */
export interface UserResponseShortened extends BaseResponse {
    /**
     * The username of the user
     */
    username: string;
    /**
     * The user's e-mail address
     */
    email: string;
    /**
     * The user's full name
     */
    name: string;
    /**
     * The user's department name
     */
    department: string;
    /**
     * The name of the user's role
     */
    role: string;
}