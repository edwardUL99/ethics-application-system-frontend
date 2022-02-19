import { ComponentType } from "./applicationcomponent";
import { QuestionComponent } from "./questioncomponent";

/**
 * This component represents a question that has options to choose from
 */
export class SelectQuestionComponent extends QuestionComponent {
    /**
     * Determines if multiple options can be selected
     */
    multiple: boolean;
    /**
     * The list of options for this question
     */
    options: Option[];
    /**
     * Determines if an option called 'Other' and textbox should be added
     */
    addOther: boolean;
    
    /**
     * Create a SelectQuestionComponent
     * @param databaseId the ID of the component in the database
     * @param title the component title
     * @param componentId the HTML ID of the component
     * @param description the question description
     * @param name the name of the question field
     * @param required true if required, false if not
     * @param multiple determines if multiple options can be selected,
     * @param options the list of options for this question component
     */
    constructor(databaseId: number, title: string, componentId: string, description: string, name: string, required: boolean,
        multiple: boolean, options: Option[]) {
        super(databaseId, ComponentType.SELECT_QUESTION, title, componentId, description, name, required);
        this.multiple = multiple;
        this.options = options;
    }
}

/**
 * This class represents an option for the select question
 */
export class Option {
    /**
     * The database ID of the option
     */
    id: number;
    /**
     * The option label
     */
    label: string;
    /**
     * The option value
     */
    value: string;
    /**
     * A UUID to uniquely identify the option
     */
    identifier: string;

    /**
     * Create an Option
     * @param id the database ID of the option
     * @param label the option label
     * @param value the option value
     * @param identifier the UUID for the option
     */
    constructor(id: number, label: string, value: string, identifier: string) {
        this.id = id;
        this.label = label;
        this.value = value;
        this.identifier = identifier;
    }
}