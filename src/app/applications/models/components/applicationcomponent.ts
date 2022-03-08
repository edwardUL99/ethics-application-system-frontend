/**
 * This file contains the base class for the application component
 */
export enum ComponentType {
    /**
     * This is the type used for text components
     */
    TEXT = "text",
    /**
     * This is the type used for choice question components
     */
    SELECT_QUESTION = "select-question",
    /**
     * This is the type used for text answer question components
     */
    TEXT_QUESTION = "text-question",
    /**
     * This is the type used for container components
     */
    CONTAINER = "container",
    /**
     * This is the type used for section components
     */
    SECTION = "section",
    /**
     * This type is used for components to gather a signature
     */
    SIGNATURE = "signature",
    /**
     * This type is used for replacement branches
     */
    REPLACEMENT_BRANCH = "replacement",
    /**
     * This type is used for action branches
     */
    ACTION_BRANCH = "action",
    /**
     * This type is used for question branches
     */
    QUESTION_BRANCH = "question",
    /**
     * This type is used for a question that is a checkbox
     */
    CHECKBOX_QUESTION = "checkbox-question",
    /**
     * This type is used for when a question provides options as a radio (one and one answer only)
     */
    RADIO_QUESTION = "radio-question",
    /**
     * This type is used for a question that is multipart
     */
    MULTIPART_QUESTION = "multipart-question",
    /**
     * This type is used for a component that is a group of checkboxes which executes a default branch
     */
    CHECKBOX_GROUP = "checkbox-group",
    /**
     * This type is used for a component that contains columns and rows of inputs giving answers to those inputs
     */
    QUESTION_TABLE = "question-table",
}

export abstract class ApplicationComponent {
    /**
     * The ID of the component in the database
     */
    databaseId: number;
    /**
     * The type of the component
     */
    protected type: ComponentType;
    /**
     * The component's title
     */
    title: string;
    /**
     * Determines if this component is composite and contains other components or not, e.g. section
     */
    private composite: boolean;
    /**
     * The ID of the component in html
     */
    readonly componentId: string;

    /**
     * Create an ApplicationComponent with the provided id, type, title and composite, componentId values
     * @param type the type of the component
     * @param title the component title
     * @param composite true if a composite component (i.e. has a getComponents() method), false if not
     * @param componentId the html id of the component
     */
    constructor(databaseId: number, type: ComponentType, title: string, composite: boolean, componentId: string) {
        this.databaseId = databaseId;
        this.type = type;
        this.title = title;
        this.composite = composite;
        this.componentId = componentId;
    }

    /**
     * Get the component type
     * @returns the component type
     */
    getType() {
        return this.type;
    }

    /**
     * Determine if the component is composite
     */
    get isComposite() {
        return this.composite;
    }

    /**
     * If this component is intended to be a form input that takes an answer, this should return true. It is by default
     * set to return fals, unless overridden.
     * 
     * The corresponding ApplicationViewComponent should implement the more specific sub-interface QuestionViewComponent if 
     * this returns true
     */
    isFormElement(): boolean {
        return false;
    }
}