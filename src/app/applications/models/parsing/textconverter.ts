import { ApplicationComponent, ComponentType } from "../components/applicationcomponent";
import { TextComponent } from "../components/textcomponent";
import { ComponentConverter, ComponentObject, validateKeys } from "./converters";
import { Converter } from './converter';
import { replaceNewLines } from '../../../utils';

/**
 * This converter converts the object to a TextComponent
 */
@Converter(ComponentType.TEXT)
export class TextConverter implements ComponentConverter {
    validate(component: ComponentObject): string | null {
        return validateKeys(ComponentType.TEXT, Object.keys(component), ['title', 'content']);
    }

    convert(component: ComponentObject): ApplicationComponent {
        const error = this.validate(component);

        if (error) {
            throw new Error(error);
        } else {
            const componentMap = component as any;
            return new TextComponent(componentMap.databaseId, componentMap.title, componentMap.componentId, replaceNewLines(componentMap.content), componentMap.nested);
        }
    }
}