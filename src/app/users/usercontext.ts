import { Injectable } from "@angular/core";
import { User } from "./user";
import { UserService } from "./user.service";
import { Observable} from "rxjs";

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

  constructor(private userService: UserService) {
    const username = localStorage.getItem('_username');

    if (username && (this._user && this._user.username == username)) {
      this._username = username;
    }
  }

  /**
   * Clear the User context
   */
  clearContext() {
    this._user = undefined;
    this._username = undefined;
    localStorage.removeItem('_username');
  }

  /**
   * Retrieve the user held in the contect
   */
  getUser(): Observable<User> {
    if (this._user == undefined || this._user == null) {
      return new Observable<User>(observable => {
        this.userService.loadUser(this._username)
          .subscribe({
            next: user => observable.next(user),
            error: e => observable.error(e)
          });
      });
    } else {
      return new Observable<User>(observable => {
        observable.next(this._user);
      });
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