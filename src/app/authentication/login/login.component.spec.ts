import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';
import { NeedsConfirmationComponent } from '../email-confirmation/needs-confirmation.component';
import { User } from '../../users/user';
import { UserService } from '../../users/user.service';
import { Account } from '../account';
import { AuthService } from '../auth.service';
import { AuthenticationResponse } from '../authenticationresponse';
import { JWTStore } from '../jwtstore';
import { environment } from '../../../environments/environment';
import { USERNAME, EMAIL, AUTH_RESPONSE, ROLE } from '../../testing/fakes';

import { LoginComponent } from './login.component';
import { UserContext } from '../../users/usercontext';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;
  let routerSpy: jasmine.Spy;
  let authService: AuthService;
  let userServiceSpy: jasmine.Spy;
  let jwtSpyValid: jasmine.Spy;
  let jwtSpyUsername: jasmine.Spy;
  let jwtSpyStore: jasmine.Spy;
  let route: ActivatedRoute;

  const authResponse: AuthenticationResponse = AUTH_RESPONSE;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginComponent ],
      providers: [
        AuthService,
        JWTStore,
        UserService,
        UserContext,
        FormBuilder
      ],
      imports: [
        RouterTestingModule.withRoutes(
          [
            { path: 'needs-confirm', component: NeedsConfirmationComponent }
          ]
        ),
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule
      ]
    })
    .compileComponents();

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    routerSpy = spyOn(router, 'navigate');

    const jwtStore = TestBed.inject(JWTStore);
    jwtSpyValid = spyOn(jwtStore, 'isTokenValid');
    jwtSpyUsername = spyOn(jwtStore, 'getUsername');
    jwtSpyStore = spyOn(jwtStore, 'storeToken');

    const userService = TestBed.inject(UserService);
    userServiceSpy = spyOn(userService, 'loadUser');

    route = TestBed.inject(ActivatedRoute);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  const setValues = (username: string, password: string) => {
    component.username.setValue(username);
    component.password.setValue(password);
  }

  it('entering valid inputs should make form valid', (done) => {
    setValues('', '');

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.form.valid).toEqual(false);

      setValues(USERNAME, "testPassword");

      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(component.form.valid).toEqual(true);
        done();
      });
    })
  });

  it('test invalid errors are displayed', (done) => {
    setValues('', '');

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.form.valid).toEqual(false);
      expect(component.username.errors?.['required']).toBeTruthy();
      expect(component.password.errors?.['required']).toBeTruthy();

      setValues('email@invalid.', 'testPassword');

      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(component.username.errors?.['username']).toBeTruthy();
        done();
      })
    })
  });

  it('test invalid error is thrown if username is email and it is not a UL e-mail', (done) => {
    environment.requireULEmail = true;
    setValues(EMAIL, 'testPassword');

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.form.valid).toEqual(false);
      expect(component.username.errors?.['username']).toEqual('The e-mail address must be a UL e-mail');
      expect(component.password.errors?.['required']).toBeFalsy();
      environment.requireULEmail = false;
      done();
    })
  });

  it ('#login should login successfully', (done) => {
    setValues(USERNAME, 'testPassword');

    fixture.detectChanges();

    const value = {
      username: USERNAME,
      password: 'testPassword',
      staySignedIn: ''
    };

    const spy = spyOn(authService, 'authenticate').and.returnValue(
      new Observable<AuthenticationResponse>(observer => observer.next(authResponse))
    );

    fixture.whenStable().then(() => {
      expect(component.form.value).toEqual(value);

      component.login();

      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(component.error).toBe(null);
        expect(jwtSpyStore).toHaveBeenCalled();
        expect(routerSpy).toHaveBeenCalledWith(['user-redirect']);
        expect(spy).toHaveBeenCalled();
        done();
      })
    })
  });

  it ('#login should navigate to needs confirm', (done) => {
    setValues(USERNAME, 'testPassword');

    fixture.detectChanges();

    const value = {
      username: USERNAME,
      password: 'testPassword',
      staySignedIn: ''
    };
    
    const error: HttpErrorResponse = new HttpErrorResponse({
      error: {
        error: 'account_not_confirmed',
      },
      status: 400
    });

    const spy = spyOn(authService, 'authenticate').and.returnValue(
      new Observable<AuthenticationResponse>(observer => observer.error(error))
    );

    fixture.whenStable().then(() => {
      component.login();

      expect(component.error).toBe(null);
      expect(routerSpy).toHaveBeenCalledWith(['needs-confirm'], {
        queryParams: {username: USERNAME, email: false}
      });
      expect(spy).toHaveBeenCalled();
      done();
    })
  });

  it ('#login should throw unknown error and display it', (done) => {
    setValues(USERNAME, 'testPassword');

    fixture.detectChanges();

    const value = {
      username: USERNAME,
      password: 'testPassword',
      staySignedIn: ''
    };
    
    const error: HttpErrorResponse = new HttpErrorResponse({
      error: {},
      status: 501
    });

    const spy = spyOn(authService, 'authenticate').and.returnValue(
      new Observable<AuthenticationResponse>(observer => observer.error(error))
    );

    fixture.whenStable().then(() => {
      component.login();

      expect(component.error).toBe('Failed to reach the server. Are you connected to the internet?');
      expect(routerSpy).not.toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
      done();
    })
  });

  it('component should redirect if already authenticated', (done) => {
    jwtSpyValid.and.returnValue(true);
    jwtSpyUsername.and.returnValue(USERNAME);
    userServiceSpy.and.returnValue(new Observable(observer => {
      const user: User = new User(USERNAME, "name", new Account(USERNAME, EMAIL, null, true), "department",
      ROLE);

      observer.next(user);
    }));

    component.ngOnInit();

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(routerSpy).toHaveBeenCalledWith(['home']);
      done();
    })
  });

  it('component should display session timeout', (done) => {
    route.snapshot.queryParams['sessionTimeout'] = true;

    component.ngOnInit();

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.error).toEqual('The session has timed out. Please login again');
      done();
    });
  })

  it('component should redirect to create user if authenticated but no user profile', (done) => {
    jwtSpyValid.and.returnValue(true);
    jwtSpyUsername.and.returnValue(USERNAME);
    userServiceSpy.and.returnValue(new Observable(observer => observer.error('404-User')));

    component.ngOnInit();

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(routerSpy).toHaveBeenCalledWith(['create-user']);
      done();
    })
  });

  it('component should clear form with error if account does not exist on redirect', (done) => {
    jwtSpyValid.and.returnValue(true);
    jwtSpyUsername.and.returnValue(USERNAME);
    userServiceSpy.and.returnValue(new Observable(observer => observer.error('404-Account')));

    const formSpy = spyOn(component.form, 'reset');

    component.ngOnInit();

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.error).toEqual('Account not found');
      expect(formSpy).toHaveBeenCalled();
      done();
    })
  });

  it('component should display unknown error if it occurs on redirect', (done) => {
    const error = "Unknown error";    

    jwtSpyValid.and.returnValue(true);
    jwtSpyUsername.and.returnValue(USERNAME);
    userServiceSpy.and.returnValue(new Observable(observer => observer.error(error)));

    const formSpy = spyOn(component.form, 'reset');

    component.ngOnInit();

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.error).toEqual(error);
      expect(formSpy).not.toHaveBeenCalled();
      done();
    })
  });
});
