import { ComponentType } from "./applicationcomponent";
import { QuestionComponent } from "./questioncomponent";

/**
 * This class represents a component to use for getting signatures
 */
export class SignatureQuestionComponent extends QuestionComponent {
    /**
     * The identifier of who is expected to sign
     */
    label: string;
    
    /**
     * Create a SignatureQuestionComponent
     * @param databaseId the ID of the component in the database
     * @param title the component title
     * @param componentId the HTML ID of the component
     * @param description the question description
     * @param name the name of the question field
     * @param label the identifier of who is expected to sign
     * @param required determines if the component is required
     */
    constructor(databaseId: number, title: string, componentId: string, description: string, name: string, label: string, required: boolean) {
        super(databaseId, ComponentType.SIGNATURE, title, componentId, description, name, required);
        this.label = label;
    }
}