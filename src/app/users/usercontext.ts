import { User } from "./user";

/**
 * This singleton class holds a currently loaded user
 */
export class UserContext {
    /**
     * The user held in the context
     */
    private _user: User;
    /**
     * The context instance
     */
    private static context: UserContext = null;

    /**
     * Prevent instantiation
     */
    private constructor() {}

    /**
     * Retrieve the singleton instance of the UserContext
     * @returns the instance of the UserContext
     */
    static getInstance(): UserContext {
        if (UserContext.context == null) {
            UserContext.context = new UserContext();
        }

        return UserContext.context;
    }

    /**
     * Retrieve the user held in the contect
     */
    get user(): User {
        return this._user;
    }

    /**
     * Set the user held by the context
     */
    set user(user: User) {
        this._user = user;
    }
}