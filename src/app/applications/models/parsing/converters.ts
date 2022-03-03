/**
 * This file is the entrypoint into the registered component converters in the system. Anytime an application component needs parsing,
 * the converter implementation should be retrieved through Converters.get(component.type), rather than importing and instantiating
 * the specific implementation file/class.
 * 
 * A converter is implemented by defining a class that implements the ComponentConverter interface, annotates the class with @Converter(ComponentType)
 * and then imports the file it's defined in, in the converters.imports.ts file.
 * 
 * E.g.:
 * 
 * ./exampleconverter.ts
 * 
 * @Converter(ComponentType.EXAMPLE_COMPONENT)
 * export class ExampleConverter implements ComponentConverter {
 *  validate(component: ComponentObject): string | null {
 *      // validations here and return error message if invalid or null if valid
 *  }
 * 
 *  convert(component: ComponentObject): ApplicationComponent {
 *      const error = this.validate(component);
 *      
 *      if (error) {
 *          throw new Error(error);
 *      } else {
 *          // convert and return parsed ApplicationComponent
 *      }
 *  }
 * }
 * 
 * ./converters.imports.ts
 * 
 * import './exampleconverter.ts' // import the example converter file and execute the annotation to register it
 * 
 * When using it then:
 * const parsed = Converters.get(component.type).convert(component); // component.type == ComponentType.EXAMPLE_COMPONENT
 */

import { ApplicationComponent, ComponentType } from "../components/applicationcomponent";

/**
 * An interface representing an object that "may" be a component waiting to be parsed,
 * i.e. it has a 'type' attribute
 */
export interface ComponentObject {
    /**
     * The component type
     */
    type: string;
}

/**
 * This interface represents a converter that can parse a given object into an ApplicationComponent
 */
export interface ComponentConverter {
    /**
     * Validate the component. Should be called before converting
     * @param component the component to validate
     * @return an error message or null if valid
     */
    validate(component: ComponentObject): string | null;
    
    /**
     * Convert the given component to an ApplicationComponent. validate should be called first and the error thrown by this method if not valid
     * @param component the component to convert
     */
    convert(component: ComponentObject): ApplicationComponent;
}

/**
 * This class holds a mapping of component converters
 */
export class Converters {
    /**
     * The converters that have been registered
     */
    private static readonly converters = {};

    /**
     * Register the converter for the given type
     * @param type the type to register the converter for
     * @param converter the converter to register
     */
    static register(type: ComponentType, converter: ComponentConverter) {
        this.converters[type] = converter;
    }

    /**
     * Retrieve the component converter, or null if not found
     * @param type the type of the converter to retrieve
     */
    static get(type: ComponentType): ComponentConverter | null;

    /**
     * Retrieve the component converter for the given type as a string
     * @param type the type as a string
     */
    static get(type: string): ComponentConverter;

    static get(type: any): ComponentConverter {
        let componentType: ComponentType;

        if (typeof(type) == 'string' || type instanceof String) {
            componentType = <ComponentType> type;
        } else {
            componentType = type as ComponentType;
        }

        if (!(componentType in this.converters)) {
            throw new Error('No converter registered for component type ' + componentType);
        } else {
            return this.converters[componentType];
        }
    }
}

/**
 * Determine if the given required keys are present in the given keys
 * @param type the type
 * @param givenKeys the given keys
 * @param required the required keys
 * @returns the error message or null if valid
 */
export function validateKeys(type: ComponentType, givenKeys: string[], required: string[]): string | null {
    let valid: boolean = true;

    for (let requiredKey of required) {
        valid = valid && givenKeys.indexOf(requiredKey) > -1;
    }

    if (!valid) {
        return `The ${type} component is missing keys, required keys are: ${required}`;
    } else {
        return null;
    }
}