import { ApplicationComponent } from '../../components/applicationcomponent';
import { Application } from '../application';
import { User } from '../../../../users/user';

/**
 * This class represents a request to answer questions on an application by 
 * another user
 */
export class AnswerRequest {
  /**
   * Construct an instance
   * @param id the ID of the request
   * @param application the application the request is associated with
   * @param user the user who is requested to answer the questions
   * @param components the components to answer
   * @param requestedAt the time the request was made at
   */
  constructor(public id: number, public application: Application, public user: User, public components: ApplicationComponent[], public requestedAt: Date) {}
}