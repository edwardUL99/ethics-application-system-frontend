import { EventEmitter } from '@angular/core';
import { Observer, Subscription } from 'rxjs';
import { Answer } from '../models/applications/answer';
import { AnswersMapping } from '../models/applications/types';
import { QuestionViewComponent } from '../view/component/application-view.component';

/**
 * A type mapping of component ID to boolean to determine if it has notified
 */
export type RegisteredComponentsNotified = {
  [key: string]: boolean;
}

/**
 * A type mapping of component ID to boolean to determine if it has notified
 */
export type RegisteredComponents = {
  [key: string]: QuestionViewComponent;
}

/**
 * This class is used to allow components that support autofill to register with and notify any interested clients.
 * Emits the new autofilled answers
 */
export class AutofillNotifier extends EventEmitter<AnswersMapping> {
  /**
   * List of subscriptions to the notifier
   */
  private subscriptions: Subscription[] = [];
  /**
   * The registered components
   */
  private registered: RegisteredComponents = {};
  /**
   * Determines if the component has been notified
   */
  private notified: RegisteredComponentsNotified = {};

  /**
   * If the component supports autofill, it should attach itself with the notifier through this method
   * @param component the component to attach
   */
  attach(component: QuestionViewComponent) {
    const id = component.component.componentId;

    if (!(id in component.application?.answers)) {
      // only attach if no answer exists already
      this.registered[id] = component;
      this.notified[id] = false;
    }
  }

  /**
   * If the component supports autofill, it should detach itself with the notifier through this method, on destruction
   * @param component the component to attach
   */
  detach(component: QuestionViewComponent) {
    const id = component.component.componentId;
    delete this.registered[id];
    delete this.notified[id];
  }

  /**
   * On destruction of the whole application, this should be called to destroy the notifier and clean up subscriptions
   */
  destroy() {
    this.registered = {};
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }

  private _getAnswers(): AnswersMapping {
    const mapping = {};

    for (let id in this.registered) {
      if (this.notified[id]) {
        const value = this.registered[id].value();

        if (!Array.isArray(value)) {
          mapping[id] = value;
        } else {
          for (let a of value) {
            mapping[a.componentId] = a;
          }
        }
      }
    }

    return mapping;
  }

  private _emit() {
    let emit: boolean = true;

    for (let key in this.registered) {
      emit = emit && this.notified[key];

      if (!emit) {
        break;
      }
    }

    if (emit) {
      this.emit(this._getAnswers());
    }
  }

  /**
   * Notify the notifier that the component has been autofilled
   * @param component the component to notify the notifier with
   */
  notify(component: QuestionViewComponent) {
    const id = component.component.componentId;

    if (!(id in component.application?.answers) && !(id in this.registered)) {
      throw new Error('The component is not attached to the notifier');
    }

    this.notified[id] = true;
    this._emit();
  }

  /**
   * Register an observer that wishes to be notified when all the autofills have been completed
   * @param observer the observer to register
   */
  register(observer: Partial<Observer<boolean>>) {
    this.subscriptions.push(this.subscribe(observer));
  }
}