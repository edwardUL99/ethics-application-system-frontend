import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

import { JWTStore } from './jwtstore';
import { Router } from '@angular/router';

/**
 * URLs that don't need authentication
 */
export const AllowedURLS = [
    '/api/auth/register/',
    '/api/auth/login/',
    '/api/auth/account/confirmed',
    '/api/auth/account/confirm/',
    '/api/auth/account/confirm/resend'
]

/**
 * This class represents an interceptor for adding the bearer token
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private jwtStore: JWTStore,
        private router: Router) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const url = req.url;
        
        const token = this.jwtStore.getToken();

        if (AllowedURLS.indexOf(url) == -1 && token) {
            if (!this.jwtStore.isTokenValid()) {
                this.router.navigate(['logout'], {
                    queryParams: {
                        sessionTimeout: true
                    }
                });
            } else {
                const cloned = req.clone({
                    headers: req.headers.set('Authorization', 'Bearer ' + token)
                });

                return next.handle(cloned);
            }
        } else {
            return next.handle(req);
        }
    }
}
