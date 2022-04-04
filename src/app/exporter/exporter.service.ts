import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { DownloadedFile } from '../files/files';
import { getErrorMessage } from '../utils';

/**
 * Provides a service to request file exports and download exported files
 */
@Injectable()
export class ExporterService {

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    if (error.status == 404) {
      return throwError(() => 'File not found');
    } else {
      return throwError(() => getErrorMessage(error));
    }
  }

  /**
   * Download the exported application(s) into a DownloadedFile instance
   * @param filename the name of the exported file
   */
  downloadExported(filename: string): Observable<DownloadedFile> {
    const url = `/api/export/download/${filename}`;

    return this.http.get(url, {
      responseType: 'blob' as 'json',
      observe: 'response'
    })
    .pipe(
      catchError(this.handleError),
      map(response => DownloadedFile.fromResponse(response))
    );
  }

  private handleExportError(e: HttpErrorResponse) {
    if (e.status == 404) {
      return of('not-found')
    } else {
      return throwError(() => getErrorMessage(e));
    }
  }

  /**
   * Export a single application with the given id and return an observable with true where
   * the export request was successfully started, false where no application could be found to export
   * @param id the ID of the application to export
   */
  singleExport(id: string): Observable<boolean> {
    const url = `/api/export/single?id=${id}`;

    return this.http.post<any>(url, {})
      .pipe(
        catchError(this.handleExportError),
        map(response => response != 'not-found')
      );
  }

  /**
   * Export applications within the given date range (inclusive) and return an observable with true where
   * the export request was successfully started, false where no application could be found to export
   * @param start start of the range in yyyy-MM-DD
   * @param end end of the range in yyyy-MM-DD
   */
  rangeExport(start: string, end: string): Observable<boolean> {
    const url = `/api/export/range?start=${start}&end=${end}`;

    return this.http.post<any>(url, {})
      .pipe(
        catchError(this.handleExportError),
        map(response => response != 'not-found')
      );
  }
}
