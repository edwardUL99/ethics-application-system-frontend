import { ApplicationComponent, ComponentType } from "../components/applicationcomponent";
import { ComponentObject, validateKeys } from "./converters";
import { Converter } from './converter';
import { Option } from "../components/selectquestioncomponent";
import { RadioQuestionComponent } from '../components/radioquestioncomponent';
import { QuestionConverter } from "./questionconverter";
import { QuestionComponent } from "../components/questioncomponent";

/**
 * This class is used for converting radio questions
 */
@Converter(ComponentType.RADIO_QUESTION)
export class RadioQuestionConverter extends QuestionConverter {
    validate(component: ComponentObject): string {
        const error = validateKeys(ComponentType.RADIO_QUESTION, Object.keys(component), ['title', 'name', 'options']);

        if (!error) {
            if (!Array.isArray((component as any).options)) {
                return 'The options field must map to a list';
            }
        }

        return null;
    }

    protected parseBase(component: ComponentObject): QuestionComponent {
        const componentMap = component as any;

        const options: Option[] = [];

        for (let option of componentMap.options) {
            options.push(new Option(option.id, option.label, option.value));
        }

        return new RadioQuestionComponent(componentMap.databaseId, componentMap.title, componentMap.componentId, componentMap.description, componentMap.name, componentMap.required, options); 
    }
}