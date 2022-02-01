import { BaseResponse } from '../baseresponse';

/**
 * This interface represents a response from confirmation endpoint
 */
export interface ConfirmationResponse  extends BaseResponse {
    /**
     * Indicates if the account has been confirmed or not
     */
    confirmed: boolean;
}