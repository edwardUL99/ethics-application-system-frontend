import { ApplicationComponent, ComponentType } from "../components/applicationcomponent";
import { ComponentObject, validateKeys } from "./converters";
import { Converter } from './converter';
import { TextQuestionComponent } from '../components/textquestioncomponent';
import { QuestionConverter } from "./questionconverter";
import { QuestionComponent } from "../components/questioncomponent";

/**
 * This class represents a converter for the text question component
 */
@Converter(ComponentType.TEXT_QUESTION)
export class TextQuestionConverter extends QuestionConverter {
    validate(component: ComponentObject): string {
        return validateKeys(ComponentType.TEXT_QUESTION, Object.keys(component), ['title', 'name']);
    }
    
    protected parseBase(component: ComponentObject): QuestionComponent {
        const componentMap = component as any;

        return new TextQuestionComponent(componentMap.databaseId, componentMap.title, componentMap.componentId,
            componentMap.description, componentMap.name, componentMap.required, componentMap.singleLine, componentMap.questionType);
    }
}