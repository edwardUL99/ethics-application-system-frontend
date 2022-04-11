import { ApplicationComponent } from '../components/applicationcomponent';
import { ComponentConverter, ComponentObject } from './converters';
import { QuestionComponent } from '../components/questioncomponent';
import { replaceNewLines } from '../../../utils';

/**
 * This class represents an abstract base for all question components to make the parsing of common properties easier
 */
export abstract class QuestionConverter implements ComponentConverter {
  /**
   * Validate the component
   * @param component the component to validate
   */
  abstract validate(component: ComponentObject): string;
  /**
   * The array of fields that this converter adds to the return value of parseBase
   */
  private readonly commonFields: string[] = ['editable', 'autofill', 'requestInput'];

  convert(component: ComponentObject): ApplicationComponent {
    const error = this.validate(component);

    if (error) {
      throw new Error(error);
    } else {
      const parsed: QuestionComponent = this.parseBase(component);
      const map = component as any;

      for (let field of this.commonFields) {
        if (field in map) {
          parsed[field] = map[field];
        }
      }

      if (parsed.description && parsed.description != null) {
        parsed.description = replaceNewLines(parsed.description);
      }

      return parsed;
    }
  }

  /**
   * Parse the base component (i.e. the properties that are specific to sub question component).
   * The convert method of this class will then add the extra parameters to the return value of this method
   * @param component the component to parse
   */
  protected abstract parseBase(component: ComponentObject): QuestionComponent;
}