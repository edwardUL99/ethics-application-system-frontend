/**
 * This interface represents a base response that all interfaces representing a response should extend
 */
export interface BaseResponse {
    /**
     * A field containing a simple message
     */
    message?: string;
    /**
     * A field containing an error message
     */
    error?: string;
}