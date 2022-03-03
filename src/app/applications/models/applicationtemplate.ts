import { ApplicationComponent } from "./components/applicationcomponent";

/**
 * This class represents an application template
 */
export class ApplicationTemplate {
  /**
   * The template database ID
   */
  databaseId: number;
  /**
   * The template identifier, e.g. expedited or full
   */
  id: string;
  /**
   * The name of the template
   */
  name: string;
  /**
   * A description of the template
   */
  description: string;
  /**
   * The version of the template
   */
  version: string;
  /**
   * The list of components
   */
  components: ApplicationComponent[];

  /**
   * Construct an application template
   * @param databaseId the database ID of the template
   * @param id the identifier of the template
   * @param name the name of the template
   * @param description the template description
   * @param version the version of the template
   * @param components the template components
   */
  constructor(databaseId: number, id: string, name: string, description: string, version: string, components: ApplicationComponent[]) {
    this.databaseId = databaseId;
    this.id = id;
    this.name = name;
    this.description = description;
    this.version = version;
    this.components = components;
  }
}