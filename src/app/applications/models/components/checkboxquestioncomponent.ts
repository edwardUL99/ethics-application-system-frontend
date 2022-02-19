import { ComponentType } from "./applicationcomponent";
import { Option, SelectQuestionComponent } from "./selectquestioncomponent";

/**
 * This class represents a question that has checkboxes that can have multiple answers.
 * It uses the options from the select question but uses checkboxes instead
 */
export class CheckboxQuestionComponent extends SelectQuestionComponent {
    /**
     * Render the checkboxes inline
     */
    inline: boolean;

    /**
     * Create a QuestionComponent
     * @param databaseId the ID of the component in the database
     * @param title the component title
     * @param componentId the HTML ID of the component
     * @param description the question description
     * @param name the name of the question field
     * @param required true if required, false if not
     * @param options the list of options
     * @param inline render the checkboxes inline
     */
    constructor(databaseId: number, title: string, componentId: string, description: string, name: string, required: boolean,
        options: Option[], inline: boolean) {
        super(databaseId, title, componentId, description, name, required, true, options);
        this.type = ComponentType.CHECKBOX_QUESTION;
        this.inline = inline;
    }
}