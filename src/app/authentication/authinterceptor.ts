import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

import { JWTStore } from './jwtstore';

/**
 * URLs that don't need authentication
 */
export const AllowedURLS = [
    '/api/auth/register',
    '/api/auth/login',
    '/api/auth/account/confirmed',
    '/api/auth/account/confirm/',
    '/api/auth/account/confirm/resend'
]

/**
 * This class represents an interceptor for adding the bearer token
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private jwtStore: JWTStore) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.jwtStore.getToken();

        if (token) {
            if (!this.jwtStore.isTokenValid()) {
                this.jwtStore.destroyToken();
                return next.handle(req);
            }

            const cloned = req.clone({
                headers: req.headers.set('Authorization', 'Bearer ' + token)
            });

            return next.handle(cloned);
        } else {
            return next.handle(req);
        }
    }
}
