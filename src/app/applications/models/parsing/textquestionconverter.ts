import { ApplicationComponent, ComponentType } from "../components/applicationcomponent";
import { ComponentConverter, ComponentObject, validateKeys } from "./converters";
import { Converter } from './converter';
import { TextQuestionComponent } from '../components/textquestioncomponent';

/**
 * This class represents a converter for the text question component
 */
@Converter(ComponentType.TEXT_QUESTION)
export class TextQuestionConverter implements ComponentConverter {
    validate(component: ComponentObject): string {
        return validateKeys(ComponentType.TEXT_QUESTION, Object.keys(component), ['title', 'name']);
    }

    convert(component: ComponentObject): ApplicationComponent {
        const error = this.validate(component);

        if (error) {
            throw new Error(error);
        } else {
            const componentMap = component as any;

            return new TextQuestionComponent(componentMap.databaseId, componentMap.title, componentMap.componentId,
                componentMap.description, componentMap.name, componentMap.required, componentMap.singleLine, componentMap.questionType);
        }
    }
}