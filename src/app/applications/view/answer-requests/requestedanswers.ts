import { QuestionComponent } from '../../models/components/questioncomponent'

/**
 * Mapping of component ID to question components
 */
type QuestionComponentMapping = {
  [key: string]: QuestionComponent
};

/**
 * Mapping of usernames to the question components to edit
 */
type RequestedAnswersMapping = {
  [key: string]: QuestionComponentMapping
};

/**
 * This class maintains a mapping of answers requested from specified users
 */
export class RequestedAnswers {
  /**
   * The mapping of requested answers
   */
  private answers: RequestedAnswersMapping = {};
  /**
   * The length of the number of users requested
   */
  length: number = 0;

  /**
   * Add a requested answer for the given username
   * @param username the username to add to the request
   * @param component the component to request answers from
   */
  addRequest(username: string, component: QuestionComponent) {
    let components: QuestionComponentMapping;

    if (username in this.answers) {
      components = this.answers[username];
    } else {
      components = {};
      this.answers[username] = components;
      this.length++;
    }

    components[component.componentId] = component;
  }

  /**
   * Remove the component from the current list of requested answers
   * @param username the username to remove the request from
   * @param component the component to remove
   */
  removeRequest(username: string, component: QuestionComponent) {
    let components: QuestionComponentMapping;

    if (username in this.answers) {
      components = this.answers[username];
      delete components[component.componentId];

      if (Object.keys(components).length == 0) {
        delete this.answers[username];
        this.length--;
      }
    }
  }

  /**
   * Get the underlying answers
   */
  getAnswers() {
    return this.answers;
  }

  /**
   * Clear all requested answers
   */
  clear() {
    this.answers = {};
    this.length = 0;
  }
}