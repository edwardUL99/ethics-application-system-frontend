import { BaseResponse } from '../../../../baseresponse';
import { UserResponse } from '../../../../users/responses/userresponse';
import { ApplicationResponse } from '../applicationresponse';
import { ComponentObject } from '../../parsing/converters';

/**
 * This represents the response to adding an answer request to the system
 */
export interface AddAnswerRequestResponse extends BaseResponse {
  /**
   * The ID of the application
   */
  id: string;
  /**
   * The username of the user
   */
  user: string;
  /**
   * The timestamp of when the request was created
   */
  requestedAt: string;
}

/**
 * This represents the response to a GET on an answer request
 */
export interface AnswerRequestResponse extends BaseResponse {
  /**
   * The ID of the request
   */
  id: number;
  /**
   * The application the request is associated with
   */
  application: ApplicationResponse;
  /**
   * The user that is to fill in the request
   */
  user: UserResponse;
  /**
   * The components to be filled in
   */
  components: ComponentObject[];
  /**
   * The timestamp of when the request was created
   */
  requestedAt: string;
}