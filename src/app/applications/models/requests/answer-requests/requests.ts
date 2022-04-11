import { AnswersMapping } from '../../applications/types';
import { ApplicationComponent } from '../../components/applicationcomponent';

/**
 * This class represents a request to add an answer request to the system
 */
export class AddAnswerRequest {
  /**
   * Create a request
   * @param id the ID of the application
   * @param username the username of the user the answers are being requested from
   * @param components the list of components to be answered
   */
  constructor(public id: string, public username: string, public components: ApplicationComponent[]) {}
}

/**
 * This class represents a request to submit the answers
 */
export class RespondAnswerRequest {
  /**
   * Create a request
   * @param requestId the id of the request
   * @param answers the answers to submit
   */
  constructor(public requestId: number, public answers: AnswersMapping) {}
}