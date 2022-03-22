/**
 * This class represents a file attached to an application
 */
export class AttachedFile {
  /**
   * Create an AttachedFile instance with the provided properties
   * @param id the id of the attached file instance (db ID)
   * @param filename the name of the file
   * @param directory the directory the file is stored in
   * @param username the username of the user that owns fthe file
   */
  constructor(public id: number, public filename: string, public directory: string, public username: string) {}
}