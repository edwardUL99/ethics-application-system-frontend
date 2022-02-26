import { HttpHandler, HttpInterceptor, HttpRequest, HttpEvent, HttpResponse, HttpHeaderResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of, share, tap } from 'rxjs';
import { CacheManager } from "./cachemanager";
import { CachingStrategy, DefaultStrategy } from "./config";
import { RESET_CACHE } from './headers';

@Injectable()
export class CachingInterceptor implements HttpInterceptor {
  /**
   * The caching strategy to determine if a response can be cached
   */
  private strategy: CachingStrategy = DefaultStrategy;

  constructor(private cache: CacheManager) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const clear = this.strategy.clearCache(req);

    if (clear) {
      this.cache.clearCache(clear);
    }
    
    if (!this.strategy.canCache(req)) {
      return next.handle(req);
    }

    if (req.headers.get(RESET_CACHE)) {
      this.cache.removeResponse(req);
    }

    const cached = this.cache.getResponse(req);

    if (cached != null) {
      return of(cached);
    } else {
      return next.handle(req).pipe(
        tap(event => {
          if (event instanceof HttpResponse) {
            this.cache.putResponse(req, event as HttpResponse<any>);
          }
        }),
        share()
      );
    }
  }
}