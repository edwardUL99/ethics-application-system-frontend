import { ApplicationComponent, ComponentType } from "../components/applicationcomponent";
import { ComponentObject, validateKeys } from "./converters";
import { QuestionConverter } from './questionconverter';
import { Converter } from './converter';
import { SignatureQuestionComponent } from '../components/signaturequestioncomponent';
import { QuestionComponent } from "../components/questioncomponent";

/**
 * This class is used for converting signatures
 */
@Converter(ComponentType.SIGNATURE)
export class SignatureQuestionConverter extends QuestionConverter {
    validate(component: ComponentObject): string {
        return validateKeys(ComponentType.SIGNATURE, Object.keys(component), ['title', 'name', 'label']);
    }

    protected parseBase(component: ComponentObject): QuestionComponent {
        const componentMap = component as any;

        return new SignatureQuestionComponent(componentMap.databaseId, componentMap.title, componentMap.componentId, 
            componentMap.description, componentMap.name, componentMap.label, componentMap.required);
    }
}