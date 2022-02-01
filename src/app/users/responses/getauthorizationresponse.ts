import { AuthorizationResponse } from './authorizationresponse';
import { BaseResponse } from '../../baseresponse';

/**
 * This interface represents a response which is an array of authorizations
 */
export interface GetAuthorizationResponse<T extends AuthorizationResponse> extends BaseResponse {
    /**
     * The array of retrieved authorizations
     */
    authorizations: T[];
}