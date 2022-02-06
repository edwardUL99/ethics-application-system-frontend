import { ApplicationComponent, ComponentType } from "../components/applicationcomponent";
import { ComponentConverter, ComponentObject, validateKeys } from "./converters";
import { Converter } from './converter';
import { SelectQuestionComponent, Option } from '../components/selectquestioncomponent';

/**
 * This class represents a converter for converting select question components
 */
@Converter(ComponentType.SELECT_QUESTION)
export class SelectQuestionConverter implements ComponentConverter {
    validate(component: ComponentObject): string {
        const error = validateKeys(ComponentType.SELECT_QUESTION, Object.keys(component), ['title', 'name', 'multiple', 'options']);

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
            };

            return new SelectQuestionComponent(componentMap.databaseId, componentMap.title, componentMap.componentId, 
                componentMap.description, componentMap.name, componentMap.required, componentMap.multiple, options, componentMap.addOther);
        }
    }
}