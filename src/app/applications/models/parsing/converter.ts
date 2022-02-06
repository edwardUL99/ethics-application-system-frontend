import { ComponentType } from '../components/applicationcomponent';
import { ComponentConverter, Converters } from './converters';

/**
 * This decorator registers a converter class.
 * You also need to import the converter in converters.definitions.ts for it to be picked up
 * @param type the type to register the converter for
 * @returns the decorator
 */
 export function Converter(type: ComponentType) {
    return <T extends ComponentConverter>(target: new () => T): new () => T => {
        Converters.register(type, new target());

        return target;
    }
}