import { ApplicationComponent, ComponentType } from "../components/applicationcomponent";
import { ComponentConverter, ComponentObject, Converters, validateKeys } from "./converters";
import { QuestionTableComponent, Cells, CellsMapping, ColumnsMapping } from '../components/questiontablecomponent';
import { QuestionComponent } from "../components/questioncomponent";
import { Converter } from "./converter";

/**
 * This class converts question table components
 */
@Converter(ComponentType.QUESTION_TABLE)
export class QuestionTableConverter implements ComponentConverter {
    validate(component: ComponentObject): string {
        return validateKeys(ComponentType.QUESTION_TABLE, Object.keys(component), ['cells', 'numRows']);
    }

    convert(component: ComponentObject): ApplicationComponent {
        const error = this.validate(component);

        if (error) {
            throw new Error(error);
        } else {
            const componentMap = component as any;
            const cellsMap = componentMap.cells;

            const columnsMapping: ColumnsMapping = {};
            const columns: CellsMapping = new CellsMapping(cellsMap.databaseId, columnsMapping);

            for (let column of Object.keys(cellsMap.columns)) {
                const cells = cellsMap.columns[column];
                const components: QuestionComponent[] = [];
                const cellsInstance: Cells = new Cells(cells.databaseId, cells.columnName, components);

                for (let component of cells.components) {
                    const questionComponent = Converters.get(component.type).convert(component) as QuestionComponent;
                    questionComponent.title = undefined; // make it undefined so it won't be rendered in a question table view
                    components.push(questionComponent);
                }

                columnsMapping[cells.columnName] = cellsInstance;
            }

            return new QuestionTableComponent(componentMap.databaseId, componentMap.componentId, columns, componentMap.numRows);
        }
    }
}