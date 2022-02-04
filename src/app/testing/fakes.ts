/*
A file to create fake objects for testing
*/

import { AuthenticationResponse } from '../authentication/authenticationresponse';
import { UserResponse } from '../users/responses/userresponse';
import { Account } from '../authentication/account';
import { Role } from '../users/role';
import { Permission } from '../users/permission';
import { User } from '../users/user';

export const USERNAME = "username";
export const EMAIL = "username@email.com";
export const TOKEN = "token";
export const EXPIRY = new Date().toISOString();
export const PASSWORD = 'testPassword';
export const CONFIRMATION_KEY = 'key';

export const AUTH_RESPONSE: AuthenticationResponse = {
    username: USERNAME,
    token: TOKEN,
    expiry: EXPIRY
};

export const DEPARTMENT = 'department';
export const NAME = 'name';

export function createUserResponse(): UserResponse {
    return {
        username: USERNAME,
        name: NAME,
        department: DEPARTMENT,
        email: EMAIL,
        role: {
            id: 1,
            name: 'User',
            description: 'default role',
            singleUser: false,
            permissions: [
            {
                id: 2,
                name: 'Permission',
                description: 'default permission'
            }
            ]
        }
    };
}

export const ACCOUNT = new Account(USERNAME, EMAIL, null, true);
export const ROLE = new Role(1, 'User', 'default role',
  [new Permission(2, 'Permission', 'default permission')], false);

export function createUser(): User {
    return new User(USERNAME, NAME, ACCOUNT, DEPARTMENT, ROLE);
}
