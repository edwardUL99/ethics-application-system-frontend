import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Fakes, MockedRequest } from './fakeresponses';

/**
 * An interceptor for returning "fakes" to configured requests
 */
@Injectable()
export class FakeInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (environment.testing) {
      const mockedRequest: MockedRequest = Fakes.getRequest(req);

      if (mockedRequest) {
        return of(new HttpResponse<any>({
          body: mockedRequest.response, status: 200, url: mockedRequest.url
        }));
      } else {
        return next.handle(req);
      }
    } else {
      return next.handle(req);
    }
  }
}