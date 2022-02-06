import { ApplicationComponent, ComponentType } from "../components/applicationcomponent";
import { ComponentConverter, ComponentObject, validateKeys } from "./converters";
import { Converter } from './converter';
import { Option } from "../components/selectquestioncomponent";
import { RadioQuestionComponent } from '../components/radioquestioncomponent';

/**
 * This class is used for converting radio questions
 */
@Converter(ComponentType.RADIO_QUESTION)
export class RadioQuestionConverter implements ComponentConverter {
    validate(component: ComponentObject): string {
        const error = validateKeys(ComponentType.RADIO_QUESTION, Object.keys(component), ['title', 'name', 'options']);

        if (!error) {
            if (!Array.isArray((component as any).options)) {
                return 'The options field must map to a list';
            }
        }

        return null;
    }

    convert(component: ComponentObject): ApplicationComponent {
        const error = this.validate(component);

        if (error) {
            throw new Error(error);
        } else {
            const componentMap = component as any;

            const options: Option[] = [];

            for (let option of componentMap.options) {
                options.push(new Option(option.id, option.label, option.value));
            }

            return new RadioQuestionComponent(componentMap.databaseId, componentMap.title, componentMap.componentId, componentMap.description, componentMap.name, componentMap.required, options);
        }
    }
}