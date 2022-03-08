import { ComponentType } from "./applicationcomponent";
import { Branch } from "./branch";

/**
 * This class represents a replacement branch
 */
export class ReplacementBranch extends Branch {
    /**
     * The list of replacements
     */
    replacements: Replacement[];

    /**
     * Construct a branch 
     * @param branchId the database ID of the branch
     * @param replacements the list of replacements
     */
     constructor(branchId: number, replacements: Replacement[]) {
        super(branchId, ComponentType.REPLACEMENT_BRANCH);
        this.replacements = replacements;
    }
}

/**
 * A replacement object for the replacement branch
 */
export class Replacement {
    /**
     * The database ID
     */
    id: number;
    /**
     * The container ID to replace
     */
    replace: string;
    /**
     * The ID of the container to add into the replacement
     */
    target: string;

    /**
     * Create a Replacement instance
     * @param id the database ID
     * @param replace the container ID to replace
     * @param target the ID of the container to add into the replacement
     */
    constructor(id: number, replace: string, target: string) {
        this.id = id;
        this.replace = replace;
        this.target = target;
    }
}