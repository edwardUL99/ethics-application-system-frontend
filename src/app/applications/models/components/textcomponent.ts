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
     * Create a SimpleComponent
     * @param databaseId the ID of the component in the database
     * @param title the component title
     * @param componentId the HTML ID of the component
     * @param content the text content of the text component
     */
    constructor(databaseId: number, title: string, componentId: string, content: string) {
        super(databaseId, ComponentType.TEXT, title, componentId);
        this.content = content;
    }
}