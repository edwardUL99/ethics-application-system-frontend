import { HttpRequest } from '@angular/common/http';
import { AUTH_RESPONSE, createAccountResponse, createApplicationTemplate, createDraftApplicationResponse, createListApplicationsResponse, createPermissionsResponse, createRolesResponse, createUserResponse } from './fakes';

/**
 * A request to mock a response for
 */
export interface MockedRequest {
  /**
   * The url to mock (mocks happen regardless of the parameters provided to the URL)
   */
  url: string;
  /**
   * The request method
   */
  method: string;
  /**
   * The response to return
   */
  response: any;
}

/**
 * A mapping of request methods to the list of mocked requests for that method
 */
type MockedRequests = {
  [key: string]: MockedRequest[]
};

/**
 * This class represents a mapping of fake responses to return if a request is hit
 */
export class FakeResponses {
  /**
   * The mocked requests
   */
  private mocked: MockedRequests;

  constructor() {
    this.mocked = {};
  }

  /**
   * Add the mocked request to the fake responses
   * @param request the request to add
   */
  addMockedRequest(request: MockedRequest) {
    if (!(request.method in this.mocked)) {
      this.mocked[request.method] = [];
    }

    this.mocked[request.method].push(request);
  }

  /**
   * Given the specified method, register a mocked response for a URL
   * @param method the method to register the request with
   */
  given(method: string): MockedRequestBuilder {
    return new MockedRequestBuilder(this, method);
  }

  /**
   * Retrieve the response that's mocked or null if not mocked
   * @param req the request received
   */
  getRequest(req: HttpRequest<any>): MockedRequest | null {
    const mockedRequests = this.mocked[req.method];

    if (mockedRequests) {
      let url = req.url;

      if (url.includes('?')) {
        url = url.substring(0, url.indexOf('?'));
      }

      for (let response of mockedRequests) {
        if (response.url == url) {
          return response;
        }
      }

      return null;
    } else {
      return null;
    }
  }
}

/**
 * A builder for creating a mocked response 
 */
class MockedRequestBuilder {
  constructor(private fakeResponses: FakeResponses, private method: string, private url: string = '') {}

  /**
   * Add the url to the mocked response
   * @param url the url to add to the mocked response
   */
  andURL(url: string) {
    this.url = url;

    return this;
  }

  /**
   * Specify the response to return
   * @param response the response to return
   * @returns the response
   */
  thenReturn(response: any) {
    this.fakeResponses.addMockedRequest({
      url: this.url,
      method: this.method,
      response: response
    });

    return this.fakeResponses;
  }
}

export const Fakes: FakeResponses = new FakeResponses();

const config = {
  'POST': [
    ['/api/auth/register/', createAccountResponse()],
    ['/api/auth/login/', AUTH_RESPONSE],
    ['/api/users/user', createUserResponse()]
  ],
  'GET': [
    ['/api/auth/account', createAccountResponse()],
    ['/api/auth/account/confirmed', {confirmed: true}],
    ['/api/users/user', createUserResponse()],
    ['/api/applications', createDraftApplicationResponse()],
    ['/api/applications/id/', {id: 'test-application-id'}],
    ['/api/applications/templates/', {applications: {test: createApplicationTemplate()}}],
    ['/api/applications/template', createApplicationTemplate()],
    ['/api/users/permissions/', createPermissionsResponse()],
    ['/api/users/roles/', createRolesResponse()],
    ['/api/applications/user', createListApplicationsResponse()]
  ]
}

Object.keys(config).forEach(method => {
  const configs = config[method];

  for (let request of configs) {
    Fakes.given(method).andURL(request[0]).thenReturn(request[1]);
  }
});