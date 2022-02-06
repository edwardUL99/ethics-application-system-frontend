import { ComponentType } from "./applicationcomponent";
import { QuestionComponent } from "./questioncomponent";

/**
 * This class represents a question that has a text-based answer
 */
export class TextQuestionComponent extends QuestionComponent {
    /**
     * Determines if the text can be entered in one or multiple lines
     */
    singleLine: boolean;
    /**
     * The qyestion type. Maps to the input type attribute
     */
    questionType: string;
    
    /**
     * Create a TextQuestionComponent
     * @param databaseId the ID of the component in the database
     * @param title the component title
     * @param componentId the HTML ID of the component
     * @param description the question description
     * @param name the name of the question field
     * @param required true if required, false if not
     * @param singleLine true if one line of text is required
     * @param questionType the type of the input for this text question
     */
    constructor(databaseId: number, title: string, componentId: string, description: string, name: string, required: boolean,
        singleLine: boolean, questionType: string) {
        super(databaseId, ComponentType.TEXT_QUESTION, title, componentId, description, name, required);
        this.singleLine = singleLine;
        this.questionType = questionType;
    }
}