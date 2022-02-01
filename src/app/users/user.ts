import { Account } from '../authentication/account';
import { Role } from './role';

/**
 * This class represents a user in the system
 */
export class User {
    /**
     * The user's username
     */
    username: string;
    /**
     * The full name of the user
     */
    name: string;
    /**
     * The user's account used for authentication
     */
    account: Account;
    /**
     * The user's department
     */
    department: string;
    /**
     * The user's role
     */
    role: Role;

    /**
     * Construct a user instance
     * @param username the user's username
     * @param name the name of the 
     * @param account the user's account 
     * @param department the department the user belongs in
     * @param role the user's role
     */
    constructor(username: string, name: string, account: Account, department: string, role: Role) {
        if (username != account.username) {
            throw Error('The username must equal the account username');
        }

        this.username = username;
        this.name = name;
        this.account = account;
        this.department = department;
        this.role = role;
    }
}