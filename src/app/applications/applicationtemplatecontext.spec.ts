import { ApplicationTemplateContext } from "./applicationtemplatecontext";
import { ApplicationTemplate } from "./models/applicationtemplate";
import { createApplicationTemplateWithContainer, TEMPLATE_ID } from '../testing/fakes';
import { SectionComponent } from "./models/components/sectioncomponent";
import { ContainerComponent } from "./models/components/containercomponent";

describe('ApplicationTemplateContext', () => {
    let context: ApplicationTemplateContext;
    let template: ApplicationTemplate;
    let replaceTemplate: ApplicationTemplate;
  
    beforeEach(() => {
        context = ApplicationTemplateContext.getInstance();
        context.clear();

        template = createApplicationTemplateWithContainer();
        replaceTemplate = createApplicationTemplateWithContainer();
        const container = (replaceTemplate.components[0] as SectionComponent).components[0] as ContainerComponent;
        container.components[0].title = 'replaced question';
        container.id = 'test-container1';
        replaceTemplate.id = 'test1';

        context.addTemplate(template);
        context.addTemplate(replaceTemplate);
        context.setCurrentTemplate(TEMPLATE_ID);
    });
  
    it('should be created', () => {
      expect(context).toBeTruthy();
    });

    it('#executeContainerReplacement should replace container', () => {
        const oldContainer = (template.components[0] as SectionComponent).components[0];
        const replaceContainer = (replaceTemplate.components[0] as SectionComponent)[0] as ContainerComponent;

        expect(oldContainer).not.toEqual(replaceContainer);

        const returned = context.executeContainerReplacement('test-container', 'test1.test-container1');
        const templateContainer = (template.components[0] as SectionComponent)[0] as ContainerComponent;

        expect(oldContainer).toEqual(returned);
        expect(templateContainer).toBe(replaceContainer);
    });

    // TODO write more tests for the context
});