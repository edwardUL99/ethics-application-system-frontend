import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { UploadFileRequest } from './requests/uploadfilerequest';
import { UploadFileResponse } from './requests/uploadfileresponse';
import { catchError, map, Observable, throwError } from 'rxjs';
import { getErrorMessage } from '../utils';
import { BaseResponse } from '../baseresponse';
import { DownloadedFile } from './files';

/**
 * This service is used to interact with the files endpoint
 */
@Injectable()
export class FilesService {
  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    if (error.status == 404) {
      return throwError(() => 'File not found');
    } else {
      return throwError(() => getErrorMessage(error));
    }
  }

  /**
   * Upload the file to the server
   * @param request the upload file request
   * @returns an observable with the response
   */
  uploadFile(request: UploadFileRequest): Observable<UploadFileResponse> {
    const formData: FormData = new FormData();

    formData.append('target', request.target);
    formData.append('file', request.file);

    if (request.directory) {
      formData.append('directory', request.directory);
    }

    return this.http.post<UploadFileResponse>('/api/files/upload/', formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get the file by downloading it from the server. It resolves the response into a Blob with the mime type set from
   * the response Content-Type
   * @param filename the name of the file to get
   * @param directory the optional directory the file may be saved under
   * @param username the username of the file owner
   */
  getFile(filename: string, directory?: string, username?: string): Observable<DownloadedFile> {
    const queryParams = {};

    if (directory) {
      queryParams['directory'] = directory;
    }

    if (username) {
      queryParams['username'] = username;
    }

    const url = `/api/files/download/${filename}`;

    return this.http.get(url, {
      responseType: 'blob' as 'json',
      observe: 'response',
      params: queryParams
    })
    .pipe(
      catchError(this.handleError),
      map(response => DownloadedFile.fromResponse(response))
    );
  }

  /**
   * Delete the specified file
   * @param filename the name of the file to get
   * @param directory the optional directory the file may be saved under
   * @param username the username of the file owner
   */
  deleteFile(filename: string, directory?: string, username?: string): Observable<BaseResponse> {
    const queryParams = {};

    if (directory) {
      queryParams['directory'] = directory;
    }

    if (username) {
      queryParams['username'] = username;
    }

    const url = `/api/files/delete/${filename}`;

    return this.http.delete<BaseResponse>(url, {
      params: queryParams
    })
    .pipe(
      catchError(this.handleError)
    );
  }
}
