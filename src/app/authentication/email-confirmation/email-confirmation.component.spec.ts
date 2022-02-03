import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { observable, Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { ConfirmationRequest } from '../confirmationrequest';
import { ConfirmationResponse } from '../confirmationresponse';

import { EmailConfirmationComponent } from './email-confirmation.component';

describe('EmailConfirmationComponent', () => {
  let component: EmailConfirmationComponent;
  let fixture: ComponentFixture<EmailConfirmationComponent>;
  let authServiceSpy: jasmine.Spy;
  let authConfirmedSpy: jasmine.Spy;
  let routerSpy: jasmine.Spy;
  let route: ActivatedRoute;

  const EMAIL = "username@example.com";
  const TOKEN = "token";

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailConfirmationComponent ],
      providers: [
        {
          provide: ActivatedRoute, useValue: {
            queryParams: new Observable(observer => observer.next({
              email: EMAIL,
              token: TOKEN
            }))
          }
        },
        AuthService,
        FormBuilder
      ],
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    const authService = TestBed.inject(AuthService);
    authServiceSpy = spyOn(authService, 'confirmAccount');

    authConfirmedSpy = spyOn(authService, 'isConfirmed');
    authConfirmedSpy.and.returnValue(new Observable<ConfirmationResponse>(observer => observer.next({confirmed: true})));

    fixture = TestBed.createComponent(EmailConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const router = TestBed.inject(Router);
    routerSpy = spyOn(router, 'navigate');

    route = TestBed.inject(ActivatedRoute);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#confirm should confirm account successfully', fakeAsync(() => {
    const expectedResponse: ConfirmationResponse = {
      confirmed: true
    };

    const request: ConfirmationRequest = new ConfirmationRequest(EMAIL, TOKEN);

    authServiceSpy.and.returnValue(new Observable<ConfirmationResponse>(observer => observer.next(expectedResponse)));

    component.confirm();

    tick();

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.initError).toBeNull();
      expect(component.confirmError).toBeNull();
      expect(authServiceSpy).toHaveBeenCalledWith(request);
      expect(routerSpy).toHaveBeenCalledWith(['login']);
    })
  }));

  it('if already confirmed, user should be notified', fakeAsync(() => {
    authConfirmedSpy.and.returnValue(new Observable<ConfirmationResponse>(observer => {
      observer.next({confirmed: true});
    }));

    component.ngOnInit();

    tick();

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.email).toEqual(EMAIL);
      expect(component.initError).toEqual('The user\'s account is already confirmed');
    })
  }));

  it('The form should be used if email or token not in query param', fakeAsync(() => {
    route.queryParams = new Observable<Params>(observer => {
      observer.next({});
    });

    expect(component.useForm).toBeFalsy();

    component.ngOnInit();
    tick();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.useForm).toBeTruthy();
      expect(fixture.debugElement.query(By.css('form'))).toBeTruthy();
    });
  }));
});
