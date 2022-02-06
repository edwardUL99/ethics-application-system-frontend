import { ApplicationComponent, ComponentType } from "../components/applicationcomponent";
import { ComponentConverter, ComponentObject, Converters, validateKeys } from "./converters";
import { Converter } from './converter';
import { MultipartQuestionComponent, QuestionBranch, QuestionPart, PartsMapping } from '../components/multipartquestioncomponent';
import { QuestionComponent } from "../components/questioncomponent";

/**
 * This class is used for converting multipart questions
 */
@Converter(ComponentType.MULTIPART_QUESTION)
export class MultipartQuestionConverter implements ComponentConverter {
    validate(component: ComponentObject): string {
        const error = validateKeys(ComponentType.MULTIPART_QUESTION, Object.keys(component), ['conditional', 'parts']);

        if (!error) {
            if (!(typeof((component as any).parts) == 'object')) {
                return 'The parts field must map to a map';
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

            const parts: PartsMapping = {};

            for (let key of Object.keys(componentMap.parts)) {
                let part = componentMap.parts[key];
                const questionComponent: QuestionComponent = Converters.get(part.question.type).convert(part.question) as QuestionComponent;

                const branches: QuestionBranch[] = [];

                for (let branch of part.branches) {
                    branches.push(new QuestionBranch(branch.branchId, branch.part, branch.value));
                }

                parts[key] = new QuestionPart(part.id, part.partName, questionComponent, branches);
            };

            return new MultipartQuestionComponent(componentMap.databaseId, componentMap.title, componentMap.componentId, 
                componentMap.required, componentMap.conditional, parts);
        }
    }
}