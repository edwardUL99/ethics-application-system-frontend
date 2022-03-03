import { ComponentType } from "./applicationcomponent";

/**
 * This class represents a branching action for an application that is triggered when a condition turns true
 */
export abstract class Branch {
    /**
     * The database ID of the branch
     */
    branchId: number;
    /**
     * The type of the branch
     */
    type: ComponentType;

    /**
     * Construct a branch 
     * @param branchId the database ID of the branch
     * @param type the type of the branch
     */
    constructor(branchId: number, type: ComponentType) {
        this.branchId = branchId;
        this.type = type;
    }
}