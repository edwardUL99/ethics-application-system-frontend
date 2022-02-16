import { BaseResponse } from "../../../baseresponse";

/**
 * This interface represents the response to generating an application ID
 */
export interface GenerateIDResponse extends BaseResponse {
  /**
   * The generated ID
   */
  id: string;
}