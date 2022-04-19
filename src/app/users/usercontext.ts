import { EventEmitter, Injectable } from "@angular/core";
import { Observable, Observer, share, Subscription } from 'rxjs';
import { User } from "./user";
import { UserService } from "./user.service";

/**
 * The local storage username key
 */
const USERNAME = '_username';
/**
 * The key for storing the user's name
 */
const NAME = '_name';

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
   * An event that can be subscribed to if a client needs to be informed that the context has updated
   */
  private _userUpdates: EventEmitter<boolean> = new EventEmitter<boolean>();

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
    localStorage.setItem(USERNAME, this._username);
    localStorage.setItem(NAME, user.name);
    this._userUpdates.emit(true);
  }

  /**
   * Subscribe to the context to be notified that the context has been updated
   * @param subscriber the subscriber function
   */
  subscribeToUpdates(subscriber: Partial<Observer<boolean>>): Subscription {
    return this._userUpdates.subscribe(subscriber);
  }

  /**
   * This should be called to notify the context that the user has been updated
   * @param user the user to update the context with
   */
  update(user: User) {
    this._user = user;
    this._username = this._user.username;
    localStorage.setItem(USERNAME, this._user.username);
    localStorage.setItem(NAME, this._user.name);
    this._userUpdates.emit(true);
  }
}