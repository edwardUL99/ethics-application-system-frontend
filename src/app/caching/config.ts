import { HttpRequest } from "@angular/common/http";

/**
 * This interface represents a path that can be configured to be cached
 */
export interface ConfiguredPath {
  /**
   * The url base path
   */
  url: string;
  /**
   * If this base url path is hit with any method that is not GET, the cache with that base will be cleared
   */
  clearCacheUrl?: string;
}

/**
 * This interface represents a strategy to use for configuring caching
 */
export interface CachingStrategy {
  /**
   * Determine if the cache should be cleared by this request
   * @param req the request that will result in the response
   * @return the base cache path for the given request to remove
   */
  clearCache(req: HttpRequest<any>): string;
  
  /**
   * Determine if the response can be cached based on the request that created the response
   * @param req the request that will result in the response
   */
  canCache(req: HttpRequest<any>): boolean;
}

/**
 * This class represents a  default strategy that can determine if caching can take place 
 */
export class DefaultCacheStrategy implements CachingStrategy {
  /**
   * The list of configured paths to cache
   */
  private configuredPaths: ConfiguredPath[];

  constructor(configuredPaths: ConfiguredPath[]) {
    this.configuredPaths = configuredPaths;
  }

  /**
   * Match the given url with a configured path instance and return it
   * @param url the url to match
   * @param field the field, either url or clearCacheUrl
   */
  private matchUrl(url: string, field: 'url' | 'clearCacheUrl'): ConfiguredPath {
    let urlFound: ConfiguredPath = undefined;

    for (let path of this.configuredPaths) {
      if (url.indexOf(path[field]) != -1) {
        return path;
      }
    }

    return urlFound;
  }

  clearCache(req: HttpRequest<any>): string {
    if (req.method !== 'GET') {
      return this.matchUrl(req.url, 'clearCacheUrl')?.clearCacheUrl;
    } else {
      return undefined;
    }
  }

  canCache(req: HttpRequest<any>): boolean {
    let urlFound = this.matchUrl(req.url, 'url');

    return urlFound !== undefined && req.method === 'GET';
  }
}

/**
 * The array of paths that can be cached with a GET request. Matches the path or subpaths e.g. /api/users/user/sub
 */
export const CachablePaths: ConfiguredPath[] = [
  { url: '/api/users/user', clearCacheUrl: '/api/users/' },
  { url: '/api/auth/account', clearCacheUrl: '/api/auth/' },
  { url: '/api/applications/templates/' }
];

/**
 * The default caching strategy
 */
export const DefaultStrategy: CachingStrategy = new DefaultCacheStrategy(CachablePaths);