import { ComponentType, ApplicationComponent } from "./applicationcomponent";

/**
 * This class represents a simple component that does not have a listing of sub-components
 */
export abstract class SimpleComponent extends ApplicationComponent {
    /**
     * Create a SimpleComponent
     * @param databaseId the ID of the component in the database
     * @param type the type of the component
     * @param title the component title
     * @param componentId the HTML ID of the component
     */
    constructor(databaseId: number, type: ComponentType, title: string, componentId: string) {
        super(databaseId, type, title, false, componentId);
    }
}