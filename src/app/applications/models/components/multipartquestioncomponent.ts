import { ComponentType } from "./applicationcomponent";
import { Branch } from "./branch";
import { QuestionComponent } from "./questioncomponent";

/**
 * A map of part name to question part
 */
export type PartsMapping = {
    [key: string]: QuestionPart;
} 

/**
 * This component represents a question that has multiple parts and can have branching defined for the parts
 */
export class MultipartQuestionComponent extends QuestionComponent {
    /**
     * Determines if the branches should execute conditionally, or always trigegred
     */
    conditional: boolean;
    /**
     * The mapping of part names to the QuestionParts
     */
    parts: PartsMapping;

    /**
     * Create a MultipartQuestionComponent
     * @param databaseId the ID of the component in the database
     * @param title the component title
     * @param componentId the HTML ID of the component
     * @param required true if required, false if not
     */
    constructor(databaseId: number, title: string, componentId: string, required: boolean, conditional: boolean, parts: PartsMapping) {
        super(databaseId, ComponentType.MULTIPART_QUESTION, title, componentId, null, null, required);
        this.conditional = conditional;
        this.parts = parts;
    }
}

/**
 * This class represents a part of the question
 */
export class QuestionPart {
    /**
     * The database ID
     */
    id: number;
    /**
     * The name of the part
     */
    partName: string;
    /**
     * The component that represents this question
     */
    question: QuestionComponent;
    /**
     * The list of branches for this part
     */
    branches: QuestionBranch[];

    /**
     * Create a QuestionPart
     * @param id the database ID
     * @param partName the name of the part
     * @param question the component that represents this question
     * @param branches the list of branches for this part
     */
    constructor(id: number, partName: string, question: QuestionComponent, branches: QuestionBranch[]) {
        this.id = id;
        this.partName = partName;
        this.question = question;
        this.branches = branches;
    }
}

/**
 * This branch is triggered based on the current value of a question and branches to a question part
 */
export class QuestionBranch extends Branch {
    /**
     * The part of the question to branch to
     */
    part: string;
    /**
     * The value of the current question that results in the branch being triggered
     */
    value: string;

    /**
     * Create a QuestionBranch
     * @param branchId the database ID
     * @param part the part to branch to
     * @param value the value that triggers the branch
     */
    constructor(branchId: number, part: string, value: string) {
        super(branchId, ComponentType.QUESTION_BRANCH);
        this.part = part;
        this.value = value;
    }
}