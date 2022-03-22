import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AuthenticationRequest } from './authenticationrequest';
import { AuthenticationResponse } from './authenticationresponse';
import { AccountResponse } from './accountresponse';
import { RegistrationRequest } from './registrationrequest';
import { ConfirmationResponse } from './confirmationresponse';
import { ConfirmationRequest } from './confirmationrequest';
import { ResetPasswordRequest } from './resetpasswordrequest';
import { Observable } from 'rxjs';
import { BaseResponse } from '../baseresponse';
import { UpdateAccountRequest } from './updateaccountrequest';

/**
 * This service gives the ability to create and authenticate user accounts
 */
@Injectable()
export class AuthService {

  constructor(private http: HttpClient) { }

  /**
   * Returns an Observable that waits for the AuthenticationResponse
   * @param request the request to make
   */
  authenticate(request: AuthenticationRequest): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>('/api/auth/login/', request);
  }

  /**
   * Returns an observable that waits for the AccountResponse after registering the account
   * @param request the request to make to the server
   */
  register(request: RegistrationRequest): Observable<AccountResponse> {
    return this.http.post<AccountResponse>('/api/auth/register/', request);
  }

  /**
   * Update the account
   * @param request the requets to make to the server
   */
  updateAccount(request: UpdateAccountRequest): Observable<BaseResponse> {
    return this.http.put<BaseResponse>('/api/auth/account/', request);
  }

  /**
   * Returns an observable which is waiting for the specified account to be retrieved
   * @param username the username of the account to retrieve
   * @param email true if the username should be treated as an email instead
   */
  getAccount(username: string, email: boolean): Observable<AccountResponse> {
    return this.http.get<AccountResponse>('/api/auth/account', {
      params: {
        username: username,
        email: '' + email
      }
    });
  }
  
  /**
   * Checks if the account is confirmed
   * @param username the username/email of the account
   * @param email true to treat the username as an email
   */
  isConfirmed(username: string, email: boolean): Observable<ConfirmationResponse> {
    return this.http.get<ConfirmationResponse>('/api/auth/account/confirmed', {
      params: {
        username: username,
        email: '' + email
      }
    });
  }

  /**
   * Sends an account confirmation request to the server
   * @param request the request for confirming the account
   */
  confirmAccount(request: ConfirmationRequest): Observable<ConfirmationResponse> {
    return this.http.post<ConfirmationResponse>('/api/auth/account/confirm/', request);
  }

  /**
   * Creates the request to re-send the confirmation email
   * @param username the username of the account
   * @param email true if the username is an email
   */
  resendConfirmationEmail(username: string, email: boolean) {
    return this.http.post(`/api/auth/account/confirm/resend?username=${username}&email=${email}`, {});
  }

  /**
   * Creates a request to send a reset password email to the account
   * @param username the username of the account
   * @param email true if the username is an email
   */
  forgotPassword(username: string, email: boolean) {
    return this.http.post(`/api/auth/forgot-password?username=${username}&email=${email}`, {});
  }

  /**
   * Creates a request to reset the account's password
   * @param request the request to send to the server
   */
  resetPassword(request: ResetPasswordRequest) {
    return this.http.post<BaseResponse>('/api/auth/reset-password/', request);
  }
}
