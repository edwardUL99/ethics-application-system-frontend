import { Account } from "../../authentication/account";
import { BaseResponse } from "../../baseresponse";
import { Role } from "../role";
import { User } from "../user";

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

/**
 * Returns a "partial" user where the account contains just username and password and the role
 * contains just the name
 * @param response the response to map
 */
export function shortResponseToUserMapper(response: UserResponseShortened): User {
    const account: Account = new Account(response.username, response.email, undefined, true);
    const role: Role = new Role(undefined, response.role, undefined, undefined, [], undefined, undefined);

    return new User(response.username, response.name, account, response.department, role);
}