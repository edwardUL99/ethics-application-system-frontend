import { ApplicationTemplateContext, ReplacedContainer } from "./applicationtemplatecontext";
import { ApplicationTemplate } from "./models/applicationtemplate";
import { createApplicationTemplateWithContainer, TEMPLATE_ID } from '../testing/fakes';
import { SectionComponent } from "./models/components/sectioncomponent";
import { ContainerComponent } from "./models/components/containercomponent";
import { MappedTemplateResponse } from "./applicationtemplateresponse";

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

  it('#setCurrentTemplate should set the current template', () => {
    context.setCurrentTemplate(TEMPLATE_ID);
    expect(context.getCurrentTemplate()).toBeTruthy();
  });

  it('#setCurrentTemplate with ID not found should leave template unchanged', () => {
    context.setCurrentTemplate(TEMPLATE_ID);
    const template = context.getCurrentTemplate();

    expect(template).toBeTruthy();

    context.setCurrentTemplate('id_not_found');

    expect(context.getCurrentTemplate()).toEqual(template);
  });

  it('#setCurrentTemplate with null or undefined should reset current template', () => {
    context.setCurrentTemplate(TEMPLATE_ID);
    expect(context.getCurrentTemplate()).toBeTruthy();

    context.setCurrentTemplate(null);
    expect(context.getCurrentTemplate()).toBeFalsy();

    context.setCurrentTemplate(TEMPLATE_ID);
    expect(context.getCurrentTemplate()).toBeTruthy();

    context.setCurrentTemplate(undefined);
    expect(context.getCurrentTemplate()).toBeFalsy();
  });

  it('#getTemplate should return the correct template', () => {
    let returned = context.getTemplate(TEMPLATE_ID);
    expect(returned).toEqual(template);

    returned = context.getTemplate('not_found');
    expect(returned).toBeFalsy();
  });

  it('#getSubComponent should successfully find subcomponent', () => {
    const subcomponent = (template.components[0] as SectionComponent).components[0];
    let returned = context.getSubComponent(TEMPLATE_ID, subcomponent.componentId);
    // the container and includeIndex variant is tested by execute container replacement tests
    expect(returned).toEqual(subcomponent);

    returned = context.getSubComponent(TEMPLATE_ID, 'not_found');
    expect(returned).toBeFalsy();
  });

  it('#removeTemplate should successfully remove template', () => {
    expect(context.getTemplate(TEMPLATE_ID)).toEqual(template);
    let returned = context.removeTemplate(TEMPLATE_ID);
    expect(returned).toEqual(template);
    expect(context.getTemplate(TEMPLATE_ID)).toBeFalsy();

    returned = context.removeTemplate(TEMPLATE_ID);
    expect(returned).toBeFalsy();
  });

  it('#clear should clear the context', () => {
    context.setCurrentTemplate(TEMPLATE_ID);
    context.clear();
    expect(context.getCurrentTemplate()).toBeFalsy();
    expect(Object.keys(context.applications).length).toBe(0);
  });

  it('#addFromResponse should populate the context', () => {
    context.clear();
    const mapping = {};
    mapping[TEMPLATE_ID] = template;
    const mappedResponse: MappedTemplateResponse = new MappedTemplateResponse(mapping);

    context.addFromResponse(mappedResponse);

    expect(context.getTemplate(TEMPLATE_ID)).toBeTruthy();
    expect(Object.keys(context.applications).length).toBeGreaterThan(0);
  })

  it('#executeContainerReplacement should replace container', () => {
    const oldContainer = (template.components[0] as SectionComponent).components[0];
    const replaceContainer = (replaceTemplate.components[0] as SectionComponent).components[0] as ContainerComponent;
    const replacedContainer = new ReplacedContainer(replaceTemplate.components[0], replaceContainer, oldContainer);

    expect(oldContainer).not.toEqual(replaceContainer);

    const returned = context.executeContainerReplacement('test-container', 'test1.test-container1');
    const templateContainer = (template.components[0] as SectionComponent).components[0] as ContainerComponent;

    expect(replacedContainer).toEqual(returned);
    expect(oldContainer).toEqual(replacedContainer.replaced);
    expect(templateContainer).toBe(replaceContainer);
  });

  it('#executeContainerReplacement should replace container with existing container', () => {
    const oldContainer = (template.components[0] as SectionComponent).components[0];
    const replaceContainer = (replaceTemplate.components[0] as SectionComponent).components[0] as ContainerComponent;

    expect(oldContainer).not.toEqual(replaceContainer);

    const returned = context.executeContainerReplacement('test-container', replaceContainer);
    const templateContainer = (template.components[0] as SectionComponent).components[0] as ContainerComponent;

    expect(oldContainer).toEqual(returned.replaced);
    expect(templateContainer).toBe(replaceContainer);
  });
});