import { ApplicationComponent, ComponentType } from "../components/applicationcomponent";
import { ContainerComponent } from "../components/containercomponent";
import { ComponentConverter, ComponentObject, Converters, validateKeys } from "./converters";
import { Converter } from './converter';

/**
 * This class represents a converter for converting containers
 */
 @Converter(ComponentType.CONTAINER)
 export class ContainerConverter implements ComponentConverter {
    /**
      * Validate the component
      * @param component the component to validate
      */
    validate(component: ComponentObject): string | null {
        let error = validateKeys(ComponentType.CONTAINER, Object.keys(component), ['id', 'components']);

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
            throw new Error(error);
        } else {
            const componentMap = component as any;
            const subComponents: ApplicationComponent[] = [];

            for (let sub of componentMap.components) {
                subComponents.push(Converters.get(sub.type).convert(sub));
            }

            return new ContainerComponent(componentMap.databaseId, componentMap.componentId, componentMap.id, subComponents);
        }
    }
 }