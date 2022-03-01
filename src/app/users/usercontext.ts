import { Injectable } from "@angular/core";
import { User } from "./user";
import { UserService } from "./user.service";
import { Observable, share} from "rxjs";

/**
 * The local storage username key
 */
const USERNAME = '_username';
/**
 * The key for storing the user's name
 */
const NAME = '_name';


// TODO this may not be working right. Make two subsequent calls to getUser and make sure second call is the stored version

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
    const username = localStorage.getItem(USERNAME);

    if (username && (this._user && this._user.username == username)) {
      this._username = username;
    }
  }

  /**
   * Get the context username
   */
  private _getUsername() {
    const username = (this._username) ? this._username : localStorage.getItem(USERNAME);
    
    if (!username) {
      throw new Error('The UserContext is not initialised, call setUser first');
    }

    return username;
  }

  getName(): string {
    return localStorage.getItem(NAME);
  }

  getUsername(): string {
    return localStorage.getItem(USERNAME);
  }

  /**
   * Clear the User context
   */
  clearContext() {
    this._user = undefined;
    this._username = undefined;
    localStorage.removeItem(USERNAME);
    localStorage.removeItem(NAME);
  }

  /**
   * Retrieve the user held in the contect
   */
  getUser(): Observable<User> {
    this._username = this._getUsername();

    if ((this._user == undefined || this._user == null) || 
      (this._user.username != this._username)) {
      return new Observable<User>(observable => {
        this.userService.loadUser(this._username)
          .pipe(
            share()
          )
          .subscribe({
            next: user => {
              this.setUser(user);
              observable.next(this._user);
              observable.complete();
            },
            error: e => {
              observable.error(e);
              observable.complete();
            }
          });
      });
    } else {
      return new Observable<User>(observable => {
        observable.next(this._user);
        observable.complete();
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
    localStorage.setItem('_name', user.name);
  }
}