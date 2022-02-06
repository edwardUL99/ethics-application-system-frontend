import { ComponentType } from "./applicationcomponent";
import { QuestionComponent } from "./questioncomponent";
import { SimpleComponent } from "./simplecomponent";

/**
 * This component represents a table where the columns are the name of the questions being asked and the rows are rows of
 * inputs to answer these questions
 */
export class QuestionTableComponent extends SimpleComponent {
    /**
     * The map of column names to the question components for the column
     */
    columns: CellsMapping;

    /**
     * 
     * @param databaseId the database ID
     * @param componentId the HTML component ID
     * @param columns the column names mapping to question components
     */
    constructor(databaseId: number, componentId: string, columns: CellsMapping) {
        super(databaseId, ComponentType.QUESTION_TABLE, null, componentId);
        this.columns = columns;
    }
}

/**
 * This class represents a list of cells for a column
 */
export class Cells {
    /**
     * The database ID
     */
    databaseId: number;
    /**
     * The name of the column
     */
    columnName: string;
    /**
     * The list of question components for the cell
     */
    components: QuestionComponent[];

    /**
     * Create a Cells instance
     * @param databaseId the database ID
     * @param columnName the column name
     * @param components the question components
     */
    constructor(databaseId: number, columnName: string, components: QuestionComponent[]) {
        this.databaseId = databaseId;
        this.columnName = columnName;
        this.components = components;
    }
}

/**
 * Mapping of column name to its Cells instanc3
 */
export type ColumnsMapping = {
    [key: string]: Cells;
}

/**
 * A mapping of column names to its cells
 */
export class CellsMapping {
    /**
     * The database ID
     */
    databaseId: number;
    /**
     * The mapping of column names to its cells
     */
    columns: ColumnsMapping;

    /**
     * Create a CellsMapping instance
     * @param databaseId the database ID
     * @param columns the mapping of column names to its cells
     */
    constructor(databaseId: number, columns: ColumnsMapping) {
        this.databaseId = databaseId;
        this.columns = columns;
    }
}