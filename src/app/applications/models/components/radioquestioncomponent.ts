import { ComponentType } from "./applicationcomponent";
import { SelectQuestionComponent, Option } from "./selectquestioncomponent";

/**
 * This question is like CheckBoxQuestion but only one answer can be selected
 */

export class RadioQuestionComponent extends SelectQuestionComponent {
    /**
     * Create a QuestionComponent
     * @param databaseId the ID of the component in the database
     * @param title the component title
     * @param componentId the HTML ID of the component
     * @param description the question description
     * @param name the name of the question field
     * @param required true if required, false if not
     * @param options the list of options
     */
    constructor(databaseId: number, title: string, componentId: string, description: string, name: string, required: boolean, options: Option[]) {
        super(databaseId, title, componentId, description, name, required, true, options, false);
        this.type = ComponentType.CHECKBOX_QUESTION;
    }
}