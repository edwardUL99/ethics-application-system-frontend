import { ApplicationComponent, ComponentType } from "./applicationcomponent";
import { CompositeComponent } from "./compositecomponent";

/**
 * This class represents an object that wraps other components in a container.
 * It is not intended to be a visual component, i.e. title sjpuld not be displayed
 */
export class ContainerComponent extends CompositeComponent {
    /**
     * The container ID
     */
    id: string;
    /**
     * The list of sub components
     */
    components: ApplicationComponent[];
    
    /**
     * Create a ContainerComponent
     * @param databaseId the ID of the component in the database
     * @param componentId the HTML ID of the component
     * @param id the container ID to identify the container uniquely
     * @param components the list of sub components inside this container
     */
    constructor(databaseId: number, componentId: string, id: string, components: ApplicationComponent[]) {
        super(databaseId, ComponentType.CONTAINER, null, componentId);
        this.id = id;
        this.components = components;
    }

    /**
     * Get the list of sub components in this container
     */
    getComponents(): ApplicationComponent[] {
        return this.components;
    }
}