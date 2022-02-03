import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, inject } from '@angular/core/testing';
import { AccountResponse } from './accountresponse';

import { AuthService } from './auth.service';
import { AuthenticationRequest } from './authenticationrequest';
import { AuthenticationResponse } from './authenticationresponse';
import { ConfirmationRequest } from './confirmationrequest';
import { ConfirmationResponse } from './confirmationresponse';
import { RegistrationRequest } from './registrationrequest';

describe('AuthService', () => {
  let httpTestingController: HttpTestingController;
  let service: AuthService;
  
  const USERNAME = 'username';
  const EMAIL = 'test@email.com';
  const PASSWORD = 'password';
  const TOKEN = 'token';
  const EXPIRY = '2021-01-01T12:30:20';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpTestingController.verify();
  })

  it('should be created', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));

  it('#authenticate should return authentication response', () => {
    const expectedResponse: AuthenticationResponse = {
      username: USERNAME,
      token: TOKEN,
      expiry: EXPIRY
    }

    const request: AuthenticationRequest = new AuthenticationRequest(USERNAME, PASSWORD, false, 2);
    
    service.authenticate(request).subscribe(data => {
      expect(data.error).toBe(undefined);
      expect(data.message).toBe(undefined);
      expect(data.username).toBe(USERNAME);
      expect(data.token).toBe(TOKEN);
      expect(data.expiry).toBe(EXPIRY);
    });

    const req = httpTestingController.expectOne('/api/auth/login/');
    expect(req.request.method).toEqual('POST');

    req.flush(expectedResponse);
  });

  it('#register should return account respone', () => {
    const expectedResponse: AccountResponse = {
      username: USERNAME,
      email: EMAIL,
      confirmed: true
    };

    const request: RegistrationRequest = new RegistrationRequest(USERNAME, EMAIL, PASSWORD, null);

    service.register(request).subscribe(data => {
      expect(data.error).toBe(undefined);
      expect(data.message).toBe(undefined);
      expect(data.username).toBe(USERNAME);
      expect(data.email).toBe(EMAIL);
      expect(data.confirmed).toBe(true);
    });

    const req = httpTestingController.expectOne('/api/auth/register/');
    expect(req.request.method).toEqual('POST');

    req.flush(expectedResponse);
  });

  it ('#getAccount should get account by username', () => {
    const expectedResponse: AccountResponse = {
      username: USERNAME,
      email: EMAIL,
      confirmed: true
    };

    service.getAccount(USERNAME, false).subscribe(data => {
      expect(data.error).toBe(undefined);
      expect(data.message).toBe(undefined);
      expect(data.username).toBe(USERNAME);
      expect(data.email).toBe(EMAIL);
      expect(data.confirmed).toBe(true);
    });

    const req = httpTestingController.expectOne(`/api/auth/account?username=${USERNAME}&email=false`);
    expect(req.request.method).toEqual('GET');

    req.flush(expectedResponse);
  });

  it ('#getAccount should get account by email', () => {
    const expectedResponse: AccountResponse = {
      username: USERNAME,
      email: EMAIL,
      confirmed: true
    };

    service.getAccount(EMAIL, true).subscribe(data => {
      expect(data.error).toBe(undefined);
      expect(data.message).toBe(undefined);
      expect(data.username).toBe(USERNAME);
      expect(data.email).toBe(EMAIL);
      expect(data.confirmed).toBe(true);
    });

    const req = httpTestingController.expectOne(`/api/auth/account?username=${EMAIL}&email=true`);
    expect(req.request.method).toEqual('GET');

    req.flush(expectedResponse);
  });

  it('#isConfirmed should check confirmed by username', () => {
    const expectedResponse: ConfirmationResponse = {
      confirmed: true
    };

    service.isConfirmed(USERNAME, false).subscribe(data => {
      expect(data.error).toBe(undefined);
      expect(data.message).toBe(undefined);
      expect(data.confirmed).toBe(true);
    });

    const req = httpTestingController.expectOne(`/api/auth/account/confirmed?username=${USERNAME}&email=false`);
    expect(req.request.method).toEqual('GET');

    req.flush(expectedResponse);
  });

  it('#isConfirmed should check confirmed by email', () => {
    const expectedResponse: ConfirmationResponse = {
      confirmed: true
    };

    service.isConfirmed(EMAIL, true).subscribe(data => {
      expect(data.error).toBe(undefined);
      expect(data.message).toBe(undefined);
      expect(data.confirmed).toBe(true);
    });

    const req = httpTestingController.expectOne(`/api/auth/account/confirmed?username=${EMAIL}&email=true`);
    expect(req.request.method).toEqual('GET');

    req.flush(expectedResponse);
  });

  it('#confirmAccout should return confirmation response', () => {
    const expectedResponse: ConfirmationResponse = {
      confirmed: true
    };

    const request: ConfirmationRequest = new ConfirmationRequest(EMAIL, 'test-token');

    service.confirmAccount(request).subscribe(data => {
      expect(data.error).toBe(undefined);
      expect(data.message).toBe(undefined);
      expect(data.confirmed).toBe(true);
    });

    const req = httpTestingController.expectOne('/api/auth/account/confirm/');
    expect(req.request.method).toBe('POST');

    req.flush(expectedResponse);
  });

  it ('#resendConfirmationEmail should resend email by username', () => {
    service.resendConfirmationEmail(USERNAME, false).subscribe(data => {
      expect(data).toBeTruthy();
    });

    const req = httpTestingController.expectOne(`/api/auth/account/confirm/resend?username=${USERNAME}&email=false`);
    expect(req.request.method).toBe('POST');

    req.flush({});
  });

  it ('#resendConfirmationEmail should resend email by email', () => {
    service.resendConfirmationEmail(EMAIL, true).subscribe(data => {
      expect(data).toBeTruthy();
    });

    const req = httpTestingController.expectOne(`/api/auth/account/confirm/resend?username=${EMAIL}&email=true`);
    expect(req.request.method).toBe('POST');

    req.flush({});
  });
});
