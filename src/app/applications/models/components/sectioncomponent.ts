import { ApplicationComponent, ComponentType } from "./applicationcomponent";
import { CompositeComponent } from "./compositecomponent";

/**
 * This class represents a section that can hold other components. Intended to be a visual component
 */
export class SectionComponent extends CompositeComponent {
    /**
     * The section's description
     */
    description: string;
    /**
     * The section's components
     */
    components: ApplicationComponent[];
    /**
     * Indicates if the questions in the section should be auto saved when fully completed
     */
    autoSave: boolean;

    /**
     * Create a SectionComponent
     * @param databaseId the ID of the component in the database
     * @param title the component title
     * @param componentId the HTML ID of the component
     * @param description the description of the section
     * @param components the list of components in the section
     * @param autoSave true if the section's questions should be auto-saved when all the questions are filled in the section
     */
    constructor(databaseId: number, title: string, componentId: string, description: string, components: ApplicationComponent[], autoSave: boolean) {
        super(databaseId, ComponentType.SECTION, title, componentId);
        this.description = description;
        this.components = components;
        this.autoSave = autoSave;
    }

    /**
     * Get all the sub-components in this section
     */
    getComponents(): ApplicationComponent[] {
        return this.components;
    }
}