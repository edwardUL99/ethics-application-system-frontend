import { BaseResponse } from '../../baseresponse';

/**
 * This represents the response to a file upload
 */
export interface UploadFileResponse extends BaseResponse {
  /**
   * The name of the file uploaded
   */
  fileName: string;
  /**
   * The URI to download the file with
   */
  downloadUri: string;
  /**
   * The type of the file uploaded
   */
  type: string;
  /**
   * The size of the uploaded file
   */
  size: number;
}