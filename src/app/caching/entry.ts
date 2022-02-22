import { HttpResponse } from '@angular/common/http';

/**
 * This class represents an entry entered into the cache
 */
export class CacheEntry {
  /**
   * Create a CacheEntry
   * @param url the url being cached
   * @param response the response being cached
   * @param entryTime the time the entry was endtered into the cache
   * @param expiry the time in milliseconds identifying how long the entry should survive for
   */
  constructor(public url: string, public response: HttpResponse<any>, public entryTime: number, public expiry: number = MAX_CACHE_AGE) {}

  /**
   * Returns true if this entry is expired or not
   */
  expired(): boolean {
    return (Date.now() - this.entryTime) > this.expiry;
  }
}

export const MAX_CACHE_AGE = 20000;