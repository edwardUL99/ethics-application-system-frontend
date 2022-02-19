import { HttpHandler, HttpInterceptor, HttpRequest, HttpEvent, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of, tap } from 'rxjs';
import { CacheManager } from "./cachemanager";
import { CachingStrategy, DefaultStrategy } from "./config";

@Injectable()
export class CachingInterceptor implements HttpInterceptor {
  /**
   * The caching strategy to determine if a response can be cached
   */
  private strategy: CachingStrategy = DefaultStrategy;

  constructor(private cache: CacheManager) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.strategy.canCache(req)) {
      return next.handle(req);
    }

    const cached = this.cache.getResponse(req);

    if (cached != null) {
      return of(cached);
    } else {
      return next.handle(req).pipe(
        tap(event => {
          if (event instanceof HttpResponse) {
            this.cache.putResponse(req, event);
          }
        })
      );
    }
  }
}