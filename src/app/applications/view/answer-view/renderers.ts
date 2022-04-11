import { Answer } from '../../models/applications/answer';

/**
 * This interface represents an object that can render the answer value
 */
export interface AnswerRenderer {
  /**
   * Takes an answer and makes it as a copied new answer in a format to render
   * @param answer the answer to render the value of. If empty, no answer should be returned
   */
  render(answer: Answer): Answer;
}

/**
 * This renderer just returns the answer that is the same as the one provided (acts as a identity function but returns the copy)
 */
export class SameAnswerRenderer implements AnswerRenderer {
  render(answer: Answer): Answer {
    return new Answer(answer.id, answer.componentId, answer.value, answer.valueType, answer.user);
  }
}

/**
 * This renderer renders an answer that represents a date
 */
export class DateAnswerRenderer implements AnswerRenderer {
  render(answer: Answer): Answer {
    const copied = new Answer(answer.id, answer.componentId, answer.value, answer.valueType, answer.user);

    if (!answer.empty() && !answer.value.match("[0-9]{2}/[0-9]{2}/[0-9]{4}")) {
      const date = new Date(answer.value);
      const yyyy = date.getFullYear();
      let mm: any = date.getMonth() + 1; // Months start at 0!
      let dd: any = date.getDate();

      if (dd < 10) dd = '0' + dd;
      if (mm < 10) mm = '0' + mm;

      const formatted = dd + '/' + mm + '/' + yyyy;
      copied.value = formatted;
    }

    return copied;
  }
}

/**
 * The type of the renderers map
 */
export type AnswerRenderers = {
  [key: string]: AnswerRenderer;
}

export const Renderers: AnswerRenderers = {};
Renderers['same'] = new SameAnswerRenderer();
Renderers['date'] = new DateAnswerRenderer();