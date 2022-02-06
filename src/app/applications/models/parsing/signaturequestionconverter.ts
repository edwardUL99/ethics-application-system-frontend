import { ApplicationComponent, ComponentType } from "../components/applicationcomponent";
import { ComponentConverter, ComponentObject, validateKeys } from "./converters";
import { Converter } from './converter';
import { SignatureQuestionComponent } from '../components/signaturequestioncomponent';

/**
 * This class is used for converting signatures
 */
@Converter(ComponentType.SIGNATURE)
export class SignatureQuestionConverter implements ComponentConverter {
    validate(component: ComponentObject): string {
        return validateKeys(ComponentType.SIGNATURE, Object.keys(component), ['title', 'name', 'label']);
    }

    convert(component: ComponentObject): ApplicationComponent {
        const error = this.validate(component);

        if (error) {
            throw new Error(error);
        } else {
            const componentMap = component as any;

            return new SignatureQuestionComponent(componentMap.databaseId, componentMap.title, componentMap.componentId, 
                componentMap.description, componentMap.name, componentMap.label);
        }
    }
}