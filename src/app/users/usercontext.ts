import { Injectable } from "@angular/core";
import { User } from "./user";
import { UserService } from "./user.service";
import { catchError, observable, Observable, retry, throwError } from "rxjs";
import { getErrorMessage } from "../utils";

/**
 * This class holds a currently loaded user
 */
@Injectable()
export class UserContext {
    /**
     * The user held in the context
     */
    private _user: User;
    /**
     * The username of the user to save in the context
     */
    private _username: string;

    /**
     * Prevent instantiation
     */
    constructor(private userService: UserService) {
        const username = localStorage.getItem('_username');

        if (username) {
            this._username = username;
        }
    }

    static clearContext() {
        localStorage.removeItem('_username');
    }

    /**
     * Retrieve the user held in the contect
     */
    getUser(): Observable<User> {
        if (this._user == undefined || this._user == null) {
            return new Observable<User>(observable => {
                this.userService.loadUser(this._username)
                    .pipe(
                        retry(3),
                        catchError(e => throwError(() => e))
                    )
                    .subscribe({
                        next: user => observable.next(user),
                        error: e => observable.error(e)
                    });
            })
        } else {
            return new Observable<User>(observable => {
                observable.next(this._user);
            })
        }
    }

    /**
     * Set the user held by the context
     */
    setUser(user: User) {
        this._user = user;
        this._username = user.username;
        localStorage.setItem('_username', this._username);
    }
}