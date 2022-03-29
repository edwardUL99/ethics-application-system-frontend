/**
 * This class represents a request to upload a file
 */
export class UploadFileRequest {
  /**
   * Create a request object
   * @param target the target file name
   * @param file the file to save
   * @param directory the directory to store the file to, if not provided it's the root
   */
  public constructor(public target: string, public file: File, public directory?: string) {}
}