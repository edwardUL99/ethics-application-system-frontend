import { Answer } from "../applications/answer";
import { ApplicationTemplate } from '../../models/applicationtemplate';
import { AttachedFile } from "../applications/attachedfile";
import { BaseResponse } from "../../../baseresponse";
import { ApplicationStatus } from "../applications/applicationstatus";
import { AnswersMapping as AnswerShapesMapping } from './applicationresponse';
import { AttachedFileShape } from './shapes';

/**
 * Mapping of component IDs to answers
 */
export type AnswersMapping = {
  [key: string]: Answer;
}

/**
 * This class represents a request to create a draft application
 */
export class CreateDraftApplicationRequest {
  /**
   * Create a request object with the provided properties
   * @param username the username of the user creating the application
   * @param applicationTemplate the template the application is based on
   * @param answers the initial answers for the draft application
   */
  constructor(public username: string, public applicationTemplate: ApplicationTemplate, public answers: AnswersMapping) {}
}

/**
 * THis class represents a request to update a draft application that has already been created
 */
export class UpdateDraftApplicationRequest {
  /**
   * 
   * @param id the id of the application being updated
   * @param answers the map of answers on the application
   * @param attachedFiles the map of any files that may have been attached
   * @param template the template to update
   */
  constructor(public id: string, public answers: AnswersMapping, public attachedFiles: AttachedFile[], public template: ApplicationTemplate) {}
}

/**
 * This interface represents a response to the create draft application request
 */
export interface CreateDraftApplicationResponse extends BaseResponse {
  /**
   * The database ID of the created application
   */
  dbId: number
  /**
   * The ID that persists through the whole application lifecycle
   */
  id: string;
  /**
   * The status of the application (should always be DRAFT)
   */
  status: ApplicationStatus;
  /**
   * The username of the user that created the draft application
   */
  username: string;
  /**
   * The ID of the template the application is based on
   */
  templateId: number;
  /**
   * The timestamp as a string of when the application was created
   */
  createdAt: string;
  /**
   * The answers returned after creating the application
   */
  answers: AnswerShapesMapping;
}

/**
 * A response to the draft application being updated
 */
export interface UpdateDraftApplicationResponse extends BaseResponse {
  /**
   * The answers after updating a draft application response
   */
  answers: AnswerShapesMapping;
  /**
   * The timestamp of when the application was last updated
   */
  lastUpdated: string;
  /**
   * The list of attached files
   */
  attachedFiles: AttachedFileShape[];
}