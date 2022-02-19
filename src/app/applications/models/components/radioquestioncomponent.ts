import { ComponentType } from "./applicationcomponent";
import { SelectQuestionComponent, Option } from "./selectquestioncomponent";

/**
 * This question is like CheckBoxQuestion but only one answer can be selected
 */

export class RadioQuestionComponent extends SelectQuestionComponent {
    /**
     * Render the radios inline
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
     * @param inline render the radios inline
     */
    constructor(databaseId: number, title: string, componentId: string, description: string, name: string, required: boolean,
        options: Option[], inline: boolean) {
        super(databaseId, title, componentId, description, name, required, true, options);
        this.type = ComponentType.RADIO_QUESTION;
        this.inline = inline;
    }
}