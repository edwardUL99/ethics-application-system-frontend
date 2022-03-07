import { MappedTemplateResponse, TemplateMapping } from './applicationtemplateresponse';
import { ApplicationTemplate } from './models/applicationtemplate';
import { ApplicationComponent, ComponentType } from './models/components/applicationcomponent';
import { CompositeComponent } from './models/components/compositecomponent';
import { ContainerComponent } from './models/components/containercomponent';
import { Converters } from './models/parsing/converters';

/**
 * The application context provides utilities for working on the templates in the system
 */
export class ApplicationTemplateContext {
  /**
   * The mapping of applications 
   */
  private _applications: TemplateMapping;
  /**
   * Allows setting of the current template being worked on in the context so that for certain operations, it can essentially act like a 'this' reference.
   * For example, with replacement operation IDs in the form <application-id>:<container-id>, for replacing into the current template, you don't need to specify
   * <application-id> if the current template is set
   */
  private _currentTemplate: ApplicationTemplate;
  /**
   * The instance of the context
   */
  private static instance: ApplicationTemplateContext;

  /**
   * Private to prevent instantiation
   */
  private constructor() {
    this._applications = {};
  }

  get applications() {
    return this._applications;
  }

  /**
   * Set the current template to the template identified by id. It must be in the context to be set as the current one. If it's not undefined or null,
   * and the ID does not exist, the current template will remain. Else if it is undefined or null, the current template will be unset
   * @param id the id of the template to set
   */
  setCurrentTemplate(id: string) {
    if (id != undefined && id != null) {
      if (id in this._applications) {
        this._currentTemplate = this._applications[id];
      }
    } else {
      this._currentTemplate = null;
    }
  }

  /**
   * Get the current template
   */
  getCurrentTemplate(): ApplicationTemplate | null {
    return this._currentTemplate;
  }

  /**
   * Get the application template by ID
   * @param id the ID of the template
   * @returns the template if found, null if not
   */
  getTemplate(id: string): ApplicationTemplate | null {
    if (id in this._applications) {
      return this._applications[id];
    } else {
      return null;
    }
  }

  private static getSubComponentRecursive(component: ApplicationComponent, componentId: string, container?: boolean, includeIndex?: boolean, parent?: ApplicationComponent, parentComponents?: ApplicationComponent[], parentIndex?: number): ApplicationComponent | FoundComponent {
    const matched = (container) ? component.getType() == ComponentType.CONTAINER && (component as ContainerComponent).id == componentId
      : component.componentId == componentId;

    if (matched) {
      if (includeIndex) {
        return new FoundComponent(parent, parentComponents, component, parentIndex);
      } else {
        return component;
      }
    }

    if (component.isComposite) {
      let found: ApplicationComponent | FoundComponent = null;
      let index: number = 0;
      let components: ApplicationComponent[] = (component as CompositeComponent).getComponents();

      for (let sub of components) {
        found = this.getSubComponentRecursive(sub, componentId, container, includeIndex, component, components, index);

        if (found != null) {
          if (includeIndex) {
            const foundComponent: ApplicationComponent = (found instanceof FoundComponent) ? found.component : found;
            return new FoundComponent(component, components, foundComponent, index);
          } else {
            return found;
          }
        }

        index++;
      }
    }

    return null;
  }

  /**
   * Gets a sub component of the application template
   * @param application the ID of the application template
   * @param componentId the component/container ID
   * @param container true if you want to search for a container. Component ID is then treated as a container ID if so
   * @param includeIndex true to include array and index information of where the component was found
   * @returns the component if found, or null if no application exists or no matching component exists. The returned value will be an instance of
   * FoundComponent if includeIndex is true
   */
  getSubComponent(application: string, componentId: string, container?: boolean, includeIndex?: boolean): ApplicationComponent | FoundComponent {
    const template: ApplicationTemplate = this.getTemplate(application);

    if (template) {
      let i = 0;
      let found: ApplicationComponent | FoundComponent = null;

      for (let component of template.components) {
        found = ApplicationTemplateContext.getSubComponentRecursive(component, componentId, container, includeIndex, undefined, template.components, i);

        if (found != null) {
          return found;
        }

        i++;
      }

      return null;
    } else {
      return null;
    }
  }

  /**
   * Adds a template to the context
   * @param application the application template to add
   */
  addTemplate(application: ApplicationTemplate) {
    this._applications[application.id] = application;
  }

  /**
   * Remove the template from the context
   * @param id the id of the template to remove from the context
   * @returns the removed template if it existed, null if not
   */
  removeTemplate(id: string): ApplicationTemplate {
    if (id in this._applications) {
      const template: ApplicationTemplate = this._applications[id];
      delete this._applications[id];

      return template;
    }

    return null;
  }

  /**
   * Clear the context of all templates
   */
  clear() {
    Object.keys(this._applications).forEach(key => delete this._applications[key]);
    this._currentTemplate = null;
  }

  /**
   * Use the mapped template response to fill the context with applications loaded from the response
   * @param response the response to add into the context
   */
  addFromResponse(response: MappedTemplateResponse) {
    for (let key of Object.keys(response.applications)) {
      this._applications[key] = response.applications[key];
    }
  }

  /**
   * Parse the <application-id>.<container-id> string
   * @param id the id to parse
   */
  private parseReplacementID(id: string): ReplacementID {
    let template: ApplicationTemplate;
    let containerID: string;

    if (id.includes('.')) {
      const dotIndex = id.indexOf('.');
      let templateID = id.substring(0, dotIndex);

      if (templateID == '') {
        template = this._currentTemplate;
      } else {
        template = (templateID in this._applications) ? this._applications[templateID] : null;
      }

      id = id.substring(dotIndex + 1);
    } else {
      template = this._currentTemplate;
    }

    containerID = id;

    return new ReplacementID(template, containerID);
  }

  private changeTemplateAfterReplacement(templateId: string) {
    // after replacing a container from another template, change the current template details
    if (templateId in this._applications) {
      const replacement = this._applications[templateId];
      const current = this._currentTemplate;
      const currentId = current.id;

      current.name = replacement.name;
      current.description = replacement.description;
      current.version = replacement.version;
      current.id = replacement.id;

      delete this._applications[currentId];
      this._applications[current.id] = current;
    }
  }

  /**
   * Executes the replacement of containers in application templates. The IDs should be in the form of 
   * <application-id>.<container-id>. If application-id is omitted, the current template is used
   * @param toReplace the ID of the container to be replaced
   * @param replacement the ID of the container to replace it with or an already existing container object
   * @returns the container that was replaced
   */
  executeContainerReplacement(toReplace: string, replacement: string | ApplicationComponent): ReplacedContainer {
    const replace: ReplacementID = this.parseReplacementID(toReplace);

    let replacementInstance: ApplicationComponent | ReplacementID;

    if (replacement instanceof String || typeof (replacement) == 'string') {
      replacementInstance = this.parseReplacementID(replacement as string);
    } else {
      replacementInstance = replacement as ContainerComponent;
    }

    const componentProvided = replacementInstance instanceof ApplicationComponent;

    if (replace.template == null || (!componentProvided && (replacementInstance as ReplacementID).template == null)) {
      return null;
    } else {
      const replaceObj = this.getSubComponent(replace.template.id, replace.container, true, true);
      const replacementId = (componentProvided) ? null : replacementInstance as ReplacementID;
      const replacementObj = (componentProvided) ?
        replacementInstance as ApplicationComponent : this.getSubComponent(replacementId.template.id, replacementId.container, true, true);

      if (replaceObj == null || replacementObj == null) {
        return null;
      }

      const foundReplace = replaceObj as FoundComponent;
      const foundReplacement = (componentProvided) ? replacementObj : replacementObj as FoundComponent;

      if (foundReplace.component == null || (!componentProvided && (foundReplacement as FoundComponent).component == null)) {
        return null;
      } else {
        const toBeReplaced = Converters.get(ComponentType.CONTAINER).convert(JSON.parse(JSON.stringify(foundReplace.component)));

        foundReplace.array[foundReplace.index] = (componentProvided) ? foundReplacement as ApplicationComponent : (foundReplacement as FoundComponent).component;
        
        if (!componentProvided) {
          this.changeTemplateAfterReplacement((replacementInstance as ReplacementID).template.id);
        }

        return new ReplacedContainer((!componentProvided) ? (foundReplacement as FoundComponent).parent:null, foundReplace.array[foundReplace.index], toBeReplaced);
      }
    }
  }

  /**
   * Get the singleton instance of the context
   */
  static getInstance(): ApplicationTemplateContext {
    if (this.instance == null) {
      this.instance = new ApplicationTemplateContext();
    }

    return this.instance;
  }
}

/**
 * This class represents a container that has been replaced
 */
export class ReplacedContainer {
  /**
   * Create a ReplacedContainer instance
   * @param parent the parent the container belonged to
   * @param container the container that has been replaced in
   * @param replaced the container that was replaced
   */
  constructor(public parent: ApplicationComponent, public container: ApplicationComponent, public replaced: ApplicationComponent) {}
}

/**
 * This class represents a parsed replacement ID to be used internally
 */
class ReplacementID {
  /**
   * The template that represents the application-id component
   */
  readonly template: ApplicationTemplate;
  /**
   * The container ID
   */
  readonly container: string;

  /**
   * Create a ReplacementID instance
   * @param template the parsed template
   * @param container the container ID
   */
  constructor(template: ApplicationTemplate, container: string) {
    this.template = template;
    this.container = container;
  }
}

/**
 * This class is used to include the index and array of a component in a recursive search
 */
export class FoundComponent {
  /**
   * The parent component
   */
  readonly parent: ApplicationComponent;
  /**
   * The array the component was found in
   */
  readonly array: ApplicationComponent[];
  /**
   * The found component
   */
  readonly component: ApplicationComponent;
  /**
   * The index in the array
   */
  readonly index: number;

  /**
   * Create a FoundComponent element
   * @param parent the parent component the component was found in
   * @param array the array the component was found in
   * @param component the found component
   * @param index the index of the component
   */
  constructor(parent: ApplicationComponent, array: ApplicationComponent[], component: ApplicationComponent, index: number) {
    this.parent = parent;
    this.array = array;
    this.component = component;
    this.index = index;
  }
}