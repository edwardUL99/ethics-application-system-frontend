import { ComponentType } from "./applicationcomponent";
import { Branch } from './branch';

/**
 * The branch executes a specified action when triggered
 */
export class ActionBranch extends Branch {
    /**
     * The branch action to execute
     */
    action: string;
    /**
     * This comment can be displayed when the action is triggered
     */
    comment: string;

    /**
     * Create an action branch
     * @param branchId the database ID of the branch
     * @param action the branch action
     * @param comment an optional comment
     */
    constructor(branchId: number, action: string, comment: string) {
        super(branchId, ComponentType.ACTION_BRANCH);
        this.action = action;
        this.comment = comment;
    }
}

/**
 * The list of action types 
 */
export const Actions = {
    /**
     * Terminate the application currently being made
     */
    TERMINATE: 'terminate',
    /**
     * Attach a file to the application
     */
    ATTACH_FILE: 'attach-file'
}