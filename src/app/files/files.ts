import { HttpResponse } from '@angular/common/http';
import { UploadFileResponse } from './requests/uploadfileresponse';
import { saveAs } from 'file-saver';

/**
 * This class represents a file downloaded from the files backend
 */
export class DownloadedFile {
  /**
   * The raw blob as json received from the files backend
   */
  private blob: any;
  /**
   * The mime type of the received file from the response
   */
  private mimeType: string;
  /**
   * The name of the file
   */
  private filename: string;

  /**
   * Create a DownloadedFile instance
   * @param blob the raw blob received from the backend as JSON
   * @param mimeType the type of the file received in the response
   * @param filename the name of the file
   */
  constructor(blob: any, mimeType: string, filename: string) {
    this.blob = blob;
    this.mimeType = mimeType;
    this.filename = filename;
  }

  /**
   * This method executes the action for the user to open/save the file
   */
  save() {
    const blob = new Blob([this.blob], {type: this.mimeType});
    saveAs(blob, this.filename);
  }

  /**
   * Parses the name of the file to download from the Content-Disposition header
   * @param response the response from downloading the file
   */
  private static getFileName(response: HttpResponse<any>): string {
    const contentDisposition = response.headers.get('Content-Disposition');

    if (!contentDisposition) {
      return 'unknown-file';
    } else {
      return decodeURIComponent(contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim());
    }
  }

  /**
   * Create a DownloadedFile instance from the given response
   * @param response the response to create the downloaded file from
   */
  static fromResponse(response: HttpResponse<any>): DownloadedFile {
    const type = response.headers.get('Content-Type');

    return new DownloadedFile(response.body, type, this.getFileName(response));
  }
}

/**
 * This class provides a utility for parsing uploaded file responses
 */
export class UploadedFile {
  /**
   * The name of the uploaded file
   */
  filename: string;
  /**
   * The directory the file is uploaded to
   */
  directory: string;
  /**
   * The username of the user that uploaded the file
   */
  username: string;
  /**
   * The size of the uploaded file
   */
  size: number;
  /**
   * The type of the uploaded file
   */
  type: string;

  /**
   * Create an UploadedFile instance
   * @param filename the name of the uploaded file
   * @param directory the directory the file is uploaded to
   * @param username the username of the user that uploaded the file
   * @param size the size of the uploaded file
   * @param type the type of the uploaded file
   */
  constructor(filename: string, directory: string, username: string, size: number, type: string) {
    this.filename = filename;
    this.directory = directory;
    this.username = username;
    this.size = size;
    this.type = type;
  }

  /**
   * Parse the search string
   * @param search the search query string
   */
  private static parseQueryParams(search: string): Object {
    const params: Object = {};
    
    for (let paramStr of search.split('&')) {
      const paramSplit = paramStr.split('=');

      if (paramSplit.length != 2) {
        console.warn('Bad Query Param: ' + paramStr)
      } else {
        params[paramSplit[0]] = decodeURIComponent(paramSplit[1]);
      }
    }

    return params;
  }

  /**
   * Parses the download URI query params for directory and username. Directory is in index 0 while username is in index 1
   * @param uri the uri to parse
   */
  private static parseUriQuery(uri: string): string[] {
    let search: string;

    const searchIndex = uri.indexOf('?');
    
    if (searchIndex > -1) {
      search = uri.substring(searchIndex + 1);
    }

    if (search) {
      const params = this.parseQueryParams(search);
      
      return [params['directory'], params['username']];
    } else {
      return [undefined, undefined];
    }
  }

  /**
   * A utility function to creare an UploadedFile instance from the response
   * @param response the response to construct the file from
   */
  static fromResponse(response: UploadFileResponse): UploadedFile {
    const filename = response.fileName;
    const uri = response.downloadUri;
    const size = response.size;
    const type = response.type;
    const params = this.parseUriQuery(uri);

    return new UploadedFile(filename, params[0], params[1], size, type);
  }
}