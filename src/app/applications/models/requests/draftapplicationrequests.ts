import { Answer } from "../applications/answer";
import { ApplicationTemplate } from '../../models/applicationtemplate';
import { AttachedFile } from "../applications/attachedfile";
import { BaseResponse } from "../../../baseresponse";
import { ApplicationStatus } from "../applications/applicationstatus";

/**
 * Mapping of component IDs to answers
 */
export type AnswersMapping = {
  [key: string]: Answer;
}

/**
 * Mapping of component IDs to the attached files
 */
export type AttachedFilesMapping = {
  [key: string]: AttachedFile;
}

/**
 * This class represents a request to create a draft application
 */
export class CreateDraftApplicationRequest {
  /**
   * Create a request object with the provided properties
   * @param username the username of the user creating the application
   * @param applicationTemplate the template the application is based on
   * @param values the initial values for the draft application
   */
  constructor(public username: string, public applicationTemplate: ApplicationTemplate, public values: AnswersMapping) {}
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
   */
  constructor(public id: string, public answers: AnswersMapping, public attachedFiles: AttachedFilesMapping) {}
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
}

/**
 * A response to the draft application being updated
 */
export interface UpdateDraftApplicationResponse extends BaseResponse {
  /**
   * The timestamp of when the application was last updated
   */
  lastUpdated: string;
}