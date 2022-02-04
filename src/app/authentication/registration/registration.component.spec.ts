import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ErrorMappings } from '../../mappings';
import { AccountResponse } from '../accountresponse';
import { AuthService } from '../auth.service';
import { RegistrationRequest } from '../registrationrequest';
import { RegistrationComponent } from './registration.component';
import { USERNAME, EMAIL, PASSWORD, CONFIRMATION_KEY } from '../../testing/fakes';

describe('RegistrationComponent', () => {
  let component: RegistrationComponent;
  let fixture: ComponentFixture<RegistrationComponent>;
  let authServiceSpy: jasmine.Spy;
  let routerSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistrationComponent ],
      providers: [
        AuthService,
        FormBuilder,
        {
          provide: ActivatedRoute, useValue: {
            queryParams: new Observable(observer => observer.next({}))
          }
        }
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
    fixture = TestBed.createComponent(RegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const authService = TestBed.inject(AuthService);
    authServiceSpy = spyOn(authService, 'register');

    const router = TestBed.inject(Router);
    routerSpy = spyOn(router, 'navigate');
  });

  const setValues = (email: string, password: string, confirmPassword: string) => {
    component.email.setValue(email);
    component.password.setValue(password);
    component.confirmPassword.setValue(confirmPassword);
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('entering valid inputs should make form valid', () => {
    setValues('', '', '');

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.form.valid).toEqual(false);

      setValues(EMAIL, PASSWORD, PASSWORD);

      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(component.form.valid).toEqual(true);
      });
    })
  });

  it('entering non-UL e-mail should throw error', () => {
    environment.requireULEmail = true;
    setValues(EMAIL, PASSWORD, PASSWORD);

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.form.valid).toEqual(false);
      expect(component.email.errors?.['invalidEmail']).toBeTruthy();
      environment.requireULEmail = false;
    })
  });

  it('entering invalid inputs should make form invalid', () => {
    setValues('', '', '');

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.form.valid).toEqual(false);

      setValues(USERNAME, PASSWORD, PASSWORD);

      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(component.form.valid).toEqual(false);
        expect(component.email.errors?.['email']).toBeTruthy();

        setValues(EMAIL, PASSWORD, PASSWORD + 'incorrect');

        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(component.form.valid).toEqual(false);
          expect(component.form.get('passwordGroup').errors?.['noMatch']).toBeTruthy();
        })
      });
    })
  });

  it('#register should register the user successfully', fakeAsync(() => {
    setValues(EMAIL, PASSWORD, PASSWORD);

    const expectedValue = {
      email: EMAIL,
      passwordGroup: {
        password: PASSWORD,
        confirmPassword: PASSWORD
      }
    };

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(component.form.value).toEqual(expectedValue);

      const request: RegistrationRequest = new RegistrationRequest(USERNAME, EMAIL, PASSWORD, undefined);

      const expectedResponse: AccountResponse = {
        username: USERNAME,
        email: EMAIL,
        confirmed: false
      };

      authServiceSpy.and.returnValue(new Observable<AccountResponse>(observer => observer.next(expectedResponse)));

      component.register();

      tick();

      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(authServiceSpy).toHaveBeenCalledWith(request);
        expect(routerSpy).not.toHaveBeenCalled();
        expect(component.error).toBeNull();
      });
    })
  }));

  it('#register should register the user successfully and direct to login if already confirmed', fakeAsync(() => {
    setValues(EMAIL, PASSWORD, PASSWORD);

    const expectedValue = {
      email: EMAIL,
      passwordGroup: {
        password: PASSWORD,
        confirmPassword: PASSWORD
      }
    };

    component.confirmationKey = CONFIRMATION_KEY;

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(component.form.value).toEqual(expectedValue);

      const request: RegistrationRequest = new RegistrationRequest(USERNAME, EMAIL, PASSWORD, CONFIRMATION_KEY);

      const expectedResponse: AccountResponse = {
        username: USERNAME,
        email: EMAIL,
        confirmed: true
      };

      authServiceSpy.and.returnValue(new Observable<AccountResponse>(observer => observer.next(expectedResponse)));

      component.register();

      tick();

      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(authServiceSpy).toHaveBeenCalledWith(request);
        expect(routerSpy).toHaveBeenCalledWith(['login']);
        expect(component.error).toBeNull();
      });
    })
  }));

  it('#register should throw error and handle it', fakeAsync(() => {
    setValues(EMAIL, PASSWORD, PASSWORD);

    const expectedValue = {
      email: EMAIL,
      passwordGroup: {
        password: PASSWORD,
        confirmPassword: PASSWORD
      }
    };

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(component.form.value).toEqual(expectedValue);

      const request: RegistrationRequest = new RegistrationRequest(USERNAME, EMAIL, PASSWORD, undefined);

      const error: HttpErrorResponse = new HttpErrorResponse({
        error: {error: 'email_exists'}, status: 400
      });

      authServiceSpy.and.returnValue(new Observable<AccountResponse>(observer => observer.error(error)));

      component.register();

      tick();

      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(authServiceSpy).toHaveBeenCalledWith(request);
        expect(routerSpy).not.toHaveBeenCalled();
        expect(component.error).toEqual(ErrorMappings.email_exists);
      });
    })
  }));
});
