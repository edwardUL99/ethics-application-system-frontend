import { ApplicationTemplate } from "./models/applicationtemplate";
import { ApplicationTemplateParser, ApplicationTemplateShape } from "./models/parsing/applicationtemplateparser";

/**
 * The mapping of the templates
 */
export type TemplateResponseMapping = {
    [key: string]: ApplicationTemplateShape
}

/**
 * This response is the response from the server for application templates request
 */
export interface ApplicationTemplateResponse {
    /**
     * The returned applications
     */
    applications: TemplateResponseMapping;
}

export type TemplateMapping = {
    [key: string]: ApplicationTemplate
}

/**
 * This class is the result of mapping the interface response to a mapped object
 */
export class MappedTemplateResponse {
    /**
     * The mapped application template IDs to the templates
     */
    applications: TemplateMapping;

    /**
     * Create a MappedTemplateResponse
     * @param applications the mapping of ID to templates
     */
    constructor(applications: TemplateMapping) {
        this.applications = applications;
    }
}

/**
 * Map the template response to a MappedTemplateResponse
 * @param response the response to map
 */
export function mapTemplateResponse(response: ApplicationTemplateResponse): MappedTemplateResponse {
    const applications: TemplateMapping = {};

    for (let key of Object.keys(response.applications)) {
        const application: ApplicationTemplateShape = response.applications[key];
        applications[application.id] = ApplicationTemplateParser.parseApplication(application);
    }

    return new MappedTemplateResponse(applications);
}