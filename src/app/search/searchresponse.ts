import { BaseResponse } from '../baseresponse';

/**
 * This interface represents a response to a search
 */
export interface SearchResponse<T> extends BaseResponse {
  /**
   * The list of results in the search response
   */
  results: T[];
}