import { Injectable } from '@angular/core'
import * as moment from 'moment';

export const Constants = {
    key: 'sessToken',
    expiry: 'sessExpiry',
    username: 'sessUsername'
};

/**
 * This class provides the ability to store JWT tokens
 */
@Injectable()
export class JWTStore {
    /**
     * Store the JWT token
     * @param username the username of the user that owns the token
     * @param token the token to store
     * @param expiry when the token expires
     */
    storeToken(username: string, token: string, expiry: string) {
        localStorage.setItem(Constants.key, token);
        localStorage.setItem(Constants.expiry, expiry);
        localStorage.setItem(Constants.username, username);
    }

    /**
     * Retrieve the stored token
     */
    getToken(): string {
        return localStorage.getItem(Constants.key);
    }

    /**
     * Get the token username
     */
    getUsername(): string {
        return localStorage.getItem(Constants.username);
    }

    /**
     * Destroy the token
     */
    destroyToken() {
        localStorage.removeItem(Constants.key);
        localStorage.removeItem(Constants.expiry);
        localStorage.removeItem(Constants.username);
    }

    /**
     * Determine if the stored token is still valid
     */
    isTokenValid(): boolean {
        const expiration = moment(this.getExpiration());
        return this.getToken() != null && expiration != null && moment().isBefore(expiration);
    }

    /**
     * Get the moment representing the token expiration date
     * @returns the expiration moment
     */
    getExpiration() {
        const expiration = localStorage.getItem(Constants.expiry);

        if (expiration == null) {
            return null;
        }

        const date = new Date(expiration);

        return date;
    }
}