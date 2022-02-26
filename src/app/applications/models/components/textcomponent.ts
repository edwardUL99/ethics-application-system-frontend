import { ComponentType } from "./applicationcomponent";
import { SimpleComponent } from "./simplecomponent";

/**
 * This component represents a simple text item
 */
export class TextComponent extends SimpleComponent {
    /**
     * The text content this component consists of
     */
    content: string;
    /**
     * Determines if the component is nested in a section or is free form outside of the section
     */
    nested: boolean;

    /**
     * Create a SimpleComponent
     * @param databaseId the ID of the component in the database
     * @param title the component title
     * @param componentId the HTML ID of the component
     * @param content the text content of the text component
     * @param nested determine if the text component is nested under a section
     */
    constructor(databaseId: number, title: string, componentId: string, content: string, nested: boolean) {
        super(databaseId, ComponentType.TEXT, title, componentId);
        this.content = content;
        this.nested = nested;
    }
}