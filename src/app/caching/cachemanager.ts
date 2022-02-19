import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { CacheEntry, MAX_CACHE_AGE } from './entry';

/**
 * This class represents a manager to handle response caching
 */
@Injectable()
export class CacheManager {
  /**
   * The map for the cache
   */
  private cacheMap: Map<string, CacheEntry>;

  constructor() {
    this.cacheMap = new Map<string, CacheEntry>();
  }

  /**
   * Get the response if cached, null otherwise
   * @param req the request
   */
  getResponse(req: HttpRequest<any>): HttpResponse<any> | null {
    const entry = this.cacheMap.get(req.urlWithParams);

    const expired: boolean = entry.expired();

    if (!entry || expired) {
      // entry either doesn't exist or it is expired
      return null;
    }

    return entry.response;
  }

  /**
   * Cache the response and remove expired cache
   * @param req the request
   * @param res the response to cache
   */
  putResponse(req: HttpRequest<any>, res: HttpResponse<any>) {
    this.cacheMap.set(req.urlWithParams, new CacheEntry(req.urlWithParams, res, Date.now()));
    this.clearExpired();
  }

  /**
   * Clear all the expired cache
   */
  clearExpired() {
    this.cacheMap.forEach(entry => {
      if (entry.expired()) {
        this.cacheMap.delete(entry.url);
      }
    })
  }
}