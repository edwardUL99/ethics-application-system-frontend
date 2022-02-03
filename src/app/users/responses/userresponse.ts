import { BaseResponse } from '../../baseresponse';
import { RoleResponse } from './roleresponse';

/**
 * This cinterface represents a user response
 */
export interface UserResponse extends BaseResponse {
    /**
     * The user's username
     */
    username: string;
    /**
     * The full name of the user
     */
    name: string;
    /**
     * The user's email address
     */
    email: string;
    /**
     * The user's department
     */
    department: string;
    /**
     * The user's role
     */
    role: RoleResponse;
}