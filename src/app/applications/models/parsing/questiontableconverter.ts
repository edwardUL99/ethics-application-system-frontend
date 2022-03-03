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
        const error = validateKeys(ComponentType.QUESTION_TABLE, Object.keys(component), ['columns', 'numRows']);
        
        if (!error) {
            const componentMap = component as any;
            const columns = componentMap.columns;

            if (!(columns instanceof Map)) {
                return 'The columns field of the ' + ComponentType.QUESTION_TABLE + ' component must be a map of the column name to its corresponding quesion';
            } else {
                for (let key of Object.keys(columns)) {
                    if (!(columns[key] instanceof Map)) {
                        return 'Each column in columns must map to a question component';
                    }
                }

                if (!(componentMap.numRows instanceof Number)) {
                    return 'The numRows field of the ' + ComponentType.QUESTION_TABLE + ' component must be a number type';
                }
            }
        }

        return null;
    }

    convert(component: ComponentObject): ApplicationComponent {
        const error = this.validate(component);

        if (error) {
            throw new Error(error);
        } else {
            const componentMap = component as any;
            const cellsMap = componentMap.columns;

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

            return new QuestionTableComponent(componentMap.databaseId, componentMap.componentId, columns);
        }
    }
}