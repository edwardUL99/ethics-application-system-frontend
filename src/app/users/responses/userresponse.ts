import { Account } from '../../authentication/account';
import { BaseResponse } from '../../baseresponse';
import { mapRole } from '../authorizations';
import { Role } from '../role';
import { User } from '../user';
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

/**
 * Maps the user response to a user with a minimal account instance (only has email and username populated, i.e. no request to retrieve the account
 * from the API is made)
 * @param response the response to map
 */
export function userResponseMapper(response: UserResponse): User {
    const role: Role = mapRole(response.role);
    const account: Account = new Account(response.username, response.email, undefined, true); // assumed to be confirmed if they have a user profile in the first place

    return new User(response.username, response.name, account, response.department, role);
}