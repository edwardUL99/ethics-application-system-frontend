import { AnswersMapping } from '../applications/types'

/**
 * Represents a request to patch the answers of the application
 */
export class PatchAnswersRequest {
  /**
   * Create the request
   * @param id the id of the application
   * @param answers the answers to patch
   */
  constructor(public id: string, public answers: AnswersMapping) {}
}