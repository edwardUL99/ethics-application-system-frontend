import { TrackedEventEmitter } from '../../../utils';
import { Answer } from '../../models/applications/answer';
import { QuestionComponent } from '../../models/components/questioncomponent';
import { QuestionChangeEvent, QuestionViewComponent } from './application-view.component';

/**
 * A mapping of the questions that have been answered
 */
type QuestionAnswered = {
  [key: string]: boolean
}

/**
 * Map of question component ID to the question
 */
type QuestionsMap = {
  [key: string]: QuestionViewComponent
}

export class AutosaveEmitter extends TrackedEventEmitter<boolean> {}

/**
 * This class manages a context for registering a list of questions that when they become filled,
 * they trigger an autosave event
 */
export class AutosaveContext {
  /**
   * This emitter should be subscribed to so that subscribers can be notified of when an autosave event should be triggered
   */
  onAutoSave: AutosaveEmitter = new AutosaveEmitter();
  /**
   * The questions added to the autosave context
   */
  private questions: QuestionsMap = {};
  /**
   * A map of questions answered to determine when autosave should be triggered
   */
  private answeredQuestions: QuestionAnswered = {};

  /**
   * Tears down (destroys) the context
   */
  tearDown() {
    this.onAutoSave.destroy();
    this.questions = {};
  }

  private checkAllRequiredAnswered() {
    let answered: boolean = true;
    
    for (let key of Object.keys(this.questions)) {
      const child = this.questions[key];
      const childAnswered = this.answeredQuestions[child.component.componentId];
      const questionComponent = child.castComponent();

      if ((!questionComponent.requestInput || childAnswered) && child.isVisible()) {
        if (questionComponent.required) {
          answered = childAnswered;

          if (!answered) {
            return false;
          }
        }
      }
    }

    if (answered && Object.keys(this.questions).length > 0) {
      this.onAutoSave.emit(true);
    }
  }

  private checkQuestionForAutoSave(event: QuestionChangeEvent) {
    const answer: Answer | Answer[] = event.view.value();

    if (answer) {
      if (Array.isArray(answer)) {
        answer.forEach(a => this.answeredQuestions[a.componentId] = !a.empty());
      } else {
        this.answeredQuestions[answer.componentId] = !answer.empty();
      }
    }

    if (event.autosave) {
      this.checkAllRequiredAnswered();
    }
  }

  private checkAutosave(event: QuestionChangeEvent) {
    const component = event.view;

    let autosaveEnabled: boolean
    
    if (typeof component.disableAutosave === 'function') {
      autosaveEnabled = !component.disableAutosave();
    } else {
      autosaveEnabled = true;
    }

    if (autosaveEnabled) {
      this.checkQuestionForAutoSave(event);
    }
  }

  /**
   * Notify the context that a question change event has taken place and the autosave satisfaction condition should be checked
   * @param e the event representing the question change
   */
  notifyQuestionChange(e: QuestionChangeEvent) {
    this.checkAutosave(e);
  }

  /**
   * Call this method to register the component
   * @param question the question to register
   */
  registerQuestion(question: QuestionViewComponent) {
    this.questions[question.component.componentId] = question;

    if (!(question.castComponent() as QuestionComponent).editable) {
      this.answeredQuestions[question.component.componentId] = true;
    }
  }

  /**
   * Remove the question from the autosave context
   * @param question the question to remove from the context
   */
  removeQuestion(question: QuestionViewComponent) {
    delete this.questions[question.component.componentId];
    delete this.answeredQuestions[question.component.componentId];
  }
}