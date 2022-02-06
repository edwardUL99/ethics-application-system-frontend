import { ApplicationComponent, ComponentType } from "./applicationcomponent";

/**
 * This vlsdd represents a component that has an attribute/notion of sub components, e.g. a container or section
 */
export abstract class CompositeComponent extends ApplicationComponent {
    /**
     * Create a CompositeComponent
     * @param databaseId the ID of the component in the database
     * @param type the type of the component
     * @param title the component title
     * @param componentId the HTML ID of the component
     */
    constructor(databaseId: number, type: ComponentType, title: string, componentId: string) {
        super(databaseId, type, title, true, componentId);
    }

    /**
     * Get the list of sub-components that this composite component consists of
     */
    abstract getComponents(): ApplicationComponent[];
}