import { ComponentType } from "./applicationcomponent";
import { Branch } from "./branch";
import { SimpleComponent } from "./simplecomponent";

/**
 * This class represents a component that represents a group of checkboxes which each execute a default
 * branch if checked, unless they define their own branch
 */
export class CheckboxGroupComponent extends SimpleComponent {
    /**
     * The default branch to execute
     */
    defaultBranch: Branch;
    /**
     * The list of checkboxes in the group
     */
    checkboxes: Checkbox[];
    /**
     * True if multiple checkboxes can be chosen in the group
     */
    multiple: boolean;

    /**
     * Create a CheckboxGroupComponent
     * @param databaseId the ID of the component in the database
     * @param componentId the HTML ID of the component
     * @param title the title
     * @param defaultBranch the default branch to execute
     * @param checkboxes the list of checkboxes in the group
     * @param multiple true if multiple checkboxes can be chosen
     */
     constructor(databaseId: number, componentId: string, title: string, defaultBranch: Branch, checkboxes: Checkbox[], multiple: boolean) {
        super(databaseId, ComponentType.CHECKBOX_GROUP, title, componentId);
        this.defaultBranch = defaultBranch;
        this.checkboxes = checkboxes;
        this.multiple = multiple;
    }
}

/**
 * This class represents a checkbox in the group
 */
export class Checkbox {
    /**
     * The database id
     */
    id: number;
    /**
     * The title of the checkbox
     */
    title: string;
    /**
     * The branch to override the default branch with
     */
    branch: Branch;

    /**
     * Create a Checkbox
     * @param id the database ID
     * @param title the title of the checkbox
     * @param branch the branch to override the default branch with
     */
    constructor(id: number, title: string, branch: Branch) {
        this.id = id;
        this.title = title;
        this.branch = branch;
    }
}