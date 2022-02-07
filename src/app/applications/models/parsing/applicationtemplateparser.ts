import { ApplicationTemplate } from "../applicationtemplate";
import { ApplicationComponent } from "../components/applicationcomponent";
import { ComponentObject, Converters } from "./converters";
import './converters.imports'; // initialise all the converters before parsing can take place


/**
 * The shape of the application template to parse
 */
export interface ApplicationTemplateShape {
    /**
     * The database ID of the template, may not be present so it is optional
     */
    databaseId?: number;
    /**
     * The unique application template identifier, e.g. expedited, full
     */
    id: string;
    /**
     * The name of the application
     */
    name: string;
    /**
     * The application description
     */
    description: string;
    /**
     * The application version
     */
    version: string;
    /**
     * The application components
     */
    components: ComponentObject[];
}

/**
 * This class represents a parser for an application template
 */
export class ApplicationTemplateParser {
    private static isTemplate(arg: any): arg is ApplicationTemplateShape {
        const keyTypes = {
            databaseId: { type: 'number', required: false },
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            version: { type: 'string' },
            components: { type: 'array' }
        };

        if (arg) {
            let valid = true;

            for (const key of Object.keys(keyTypes)) {
                const typeObj = keyTypes[key]
                const type = typeObj.type;

                let required = type.required;
                if (required == null || required == undefined) {
                    required = true;
                }

                if (!required) {
                    if (type == 'array') {
                        valid = valid && Array.isArray(arg[key]);
                    } else {
                        valid = valid && typeof(arg[key]) == type;
                    }
                } else {
                    valid = valid && true;
                }
            }

            return valid;
        }

        return false;
    }

    /**
     * Parse an application object into an applcation template
     * @param application the application object
     */
    static parseApplication(application: ApplicationTemplateShape): ApplicationTemplate {
        if (!this.isTemplate(application)) {
            throw new Error('Invalid application template');
        } else {
            const components: ApplicationComponent[] = [];

            for (let component of application.components) {
                components.push(Converters.get(component.type).convert(component))
            }

            return new ApplicationTemplate(application.databaseId, application.id, application.name,
                application.description, application.version, components);
        }
    }
}