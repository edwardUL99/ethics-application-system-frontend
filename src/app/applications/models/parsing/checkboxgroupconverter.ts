import { ApplicationComponent, ComponentType } from "../components/applicationcomponent";
import { ComponentConverter, ComponentObject, validateKeys } from "./converters";
import { Converter } from './converter';
import { CheckboxGroupComponent, Checkbox } from '../components/checkboxgroupcomponent';
import { Branch } from "../components/branch";
import { ActionBranch } from '../components/actionbranch';
import { Replacement, ReplacementBranch } from "../components/replacementbranch";

/**
 * This class is used for converting checkbox groups
 */
@Converter(ComponentType.CHECKBOX_GROUP)
export class CheckboxGroupConverter implements ComponentConverter {
    validate(component: ComponentObject): string {
        const error = validateKeys(ComponentType.CHECKBOX_GROUP, Object.keys(component), ['title', 'defaultBranch', 'checkboxes']);

        if (!error) {
            const componentMap = component as any;

            if (componentMap.defaultBranch != null && !(typeof(componentMap.defaultBranch) == 'object')) {
                return 'The defaultBranch field must map to a map';
            } else if (!Array.isArray(componentMap.checkboxes)) {
                return 'The checkboxes field must map to a list';
            }
        }

        return null;
    }

    private parseBranch(branch: any): Branch {
        if (branch) {
            const type: ComponentType = branch.type;

            if (ComponentType.ACTION_BRANCH === type) {
                return new ActionBranch(branch.branchId, branch.action, branch.comment);
            } else if (ComponentType.REPLACEMENT_BRANCH === type) {
                const replacements: Replacement[] = [];

                for (let replacement of branch.replacements) {
                    replacements.push(new Replacement(replacement.id, replacement.replace, replacement.target));
                }

                return new ReplacementBranch(branch.branchId, replacements);
            } else {
                throw new Error('Illegal branch type: ' + type);
            }
        } else {
            return null;
        }
    }

    convert(component: ComponentObject): ApplicationComponent {
        const error = this.validate(component);

        if (error) {
            throw new Error(error);
        } else {
            const componentMap = component as any;

            const defaultBranch: Branch = this.parseBranch(componentMap.defaultBranch);
            const checkboxes: Checkbox[] = [];

            for (let checkbox of componentMap.checkboxes) {
                const branch: Branch = ('branch' in checkbox) ? this.parseBranch(checkbox.branch):null;
                checkboxes.push(new Checkbox(checkbox.id, checkbox.title, checkbox.identifier, branch));
            }

            return new CheckboxGroupComponent(componentMap.databaseId, componentMap.componentId, componentMap.title,
                defaultBranch, checkboxes, componentMap.multiple, componentMap.required);
        }
    }
}