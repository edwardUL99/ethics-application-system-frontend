import { HttpRequest, HttpResponse } from "@angular/common/http";

/**
 * This interface represents a strategy to use for configuring caching
 */
export interface CachingStrategy {
  /**
   * Determine if the response can be cached based on the request that created the response
   * @param req the request tha will result in the response
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
  private configuredPaths: string[];

  constructor(configuredPaths: string[]) {
    this.configuredPaths = configuredPaths;
  }

  canCache(req: HttpRequest<any>): boolean {
    let urlFound = false;

    for (let url of this.configuredPaths) {
      if (req.url.indexOf(url) != -1) {
        urlFound = true;
        break;
      }
    }

    return urlFound && req.method === 'GET';
  }
}

/**
 * The array of paths that can be cached with a GET request. Matches the path or subpaths e.g. /api/users/user/sub
 */
export const CachablePaths: string[] = [
  '/api/users/user'
];

/**
 * The default caching strategy
 */
export const DefaultStrategy: CachingStrategy = new DefaultCacheStrategy(CachablePaths);