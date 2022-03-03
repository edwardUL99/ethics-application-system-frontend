import { ApplicationComponent, ComponentType } from "../components/applicationcomponent";
import { SectionComponent } from "../components/sectioncomponent";
import { ComponentConverter, ComponentObject, Converters, validateKeys } from "./converters";
import { Converter } from './converter';
import { replaceNewLines } from '../../../utils';

/**
 * This class represents a converter for converting sections
 */
 @Converter(ComponentType.SECTION)
 export class SectionConverter implements ComponentConverter {
    /**
      * Validate the component
      * @param component the component to validate
      */
    validate(component: ComponentObject): string | null {
        let error = validateKeys(ComponentType.SECTION, Object.keys(component), ['title', 'components']);

        if (error) {
            return error;
        } else {
            if (!Array.isArray((component as any).components)) {
                return 'components is expected to be a list but it is not';
            } else {
                return null;
            }
        }
    }
 
    /**
      * Convert the object 
      * @param component the component to convert
      */
    convert(component: ComponentObject): ApplicationComponent {
        const error = this.validate(component);

        if (error) {
            console.log(component);
            throw new Error(error);
        } else {
            const componentMap = component as any;
            const subComponents: ApplicationComponent[] = [];

            for (let sub of componentMap.components) {
                subComponents.push(Converters.get(sub.type).convert(sub));
            }

            return new SectionComponent(componentMap.databaseId, componentMap.title, componentMap.componentId, 
               replaceNewLines(componentMap.description), subComponents, componentMap.autoSave);
        }
    }
 }