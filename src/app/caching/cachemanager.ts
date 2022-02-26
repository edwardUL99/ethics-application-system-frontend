import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { CacheEntry, MAX_CACHE_AGE } from './entry';
import { CACHE_EXPIRY } from './headers';

/**
 * This type represents a mapping for cache
 */
export type CacheMap = {
  [key: string]: CacheEntry
};

/**
 * This class represents a manager to handle response caching
 */
@Injectable()
export class CacheManager {
  /**
   * The map for the cache
   */
  private cacheMap: CacheMap;

  constructor() {
    this.cacheMap = {};
  }

  /**
   * Get the response if cached, null otherwise
   * @param req the request
   */
  getResponse(req: HttpRequest<any>): HttpResponse<any> | null {
    const entry = this.cacheMap[req.urlWithParams];

    if (!entry || entry.expired()) {
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
    if (res) {
      let expiry: any = req.headers.get(CACHE_EXPIRY);

      if (expiry) {
        expiry = parseInt(expiry);
      } else {
        expiry = MAX_CACHE_AGE;
      }

      this.cacheMap[req.urlWithParams] = new CacheEntry(req.urlWithParams, res, Date.now(), expiry);
      this.clearExpired();
    }
  }

  /**
   * Clear the cached response for the given request if it exists
   * @param req the request to clear any cached response for
   */
  removeResponse(req: HttpRequest<any>) {
    const url = req.urlWithParams;
    
    if (url in this.cacheMap) {
      delete this.cacheMap[url];
    }
  }

  /**
   * Clears the cache
   * @param urlBase only clear cache with the url being the base of it. If not provided, all is cleared
   */
  clearCache(urlBase?: string) {
    if (!urlBase) {
      this.cacheMap = {};
    } else {
      Object.keys(this.cacheMap).forEach(key => {
        const entry: CacheEntry = this.cacheMap[key];
        if (entry.url.indexOf(urlBase) != -1) {
          delete this.cacheMap[entry.url];
        }
      });
    }
  }

  /**
   * Clear all the expired cache
   */
  clearExpired() {
    Object.keys(this.cacheMap).forEach(key => {
      const entry: CacheEntry = this.cacheMap[key];
      if (entry.expired()) {
        delete this.cacheMap[entry.url];
      }
    });
  }
}