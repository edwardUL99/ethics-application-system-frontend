import { ComponentType } from "./applicationcomponent";
import { SimpleComponent } from "./simplecomponent";

/**
 * A question component is a component that an answer is provided for it.
 */
export abstract class QuestionComponent extends SimpleComponent {
    /**
     * The question description
     */
    description: string;
    /**
     * The question name
     */
    name: string;
    /**
     * True if the question is required, false if not
     */
    required: boolean;
    /**
     * Determines if the component can be edited
     */
    editable: boolean = true;
    /**
     * The autofill query string
     */
    autofill: string;
    /**
     * Specifies that input from another user should be requested as the answer to this component
     */
    requestInput: boolean;
    
    /**
     * Create a QuestionComponent
     * @param databaseId the ID of the component in the database
     * @param type the type of the component
     * @param title the component title
     * @param componentId the HTML ID of the component
     * @param description the question description
     * @param name the name of the question field
     * @param required true if required, false if not
     * @param editable determines if the component can be edited 
     * @param autofill the autofill query string
     */
    constructor(databaseId: number, type: ComponentType, title: string, componentId: string, description: string, name: string, required: boolean,
        editable: boolean = true, autofill: string = undefined) {
        super(databaseId, type, title, componentId);
        this.description = description;
        this.name = name;
        this.required = required;
        this.editable = editable;
        this.autofill = autofill;
    }

    /**
     * This is a form element, so returns true
     * @returns true
     */
    isFormElement(): boolean {
       return true; 
    }
}