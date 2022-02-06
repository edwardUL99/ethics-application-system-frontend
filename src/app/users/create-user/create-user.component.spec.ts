import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';
import { AuthService } from '../../authentication/auth.service';
import { JWTStore } from '../../authentication/jwtstore';
import { CreateUpdateUserRequest } from '../createupdateuserrequest';
import { UserResponse } from '../responses/userresponse';
import { UserService } from '../user.service';
import { USERNAME, NAME, DEPARTMENT } from '../../testing/fakes';

import { ErrorMappings } from '../../mappings';

import { CreateUserComponent } from './create-user.component';

describe('CreateUserComponent', () => {
  let component: CreateUserComponent;
  let fixture: ComponentFixture<CreateUserComponent>;
  let userServiceGet: jasmine.Spy;
  let userServiceCreate: jasmine.Spy;
  let routerSpy: jasmine.Spy;
  let jwtStoreValid: jasmine.Spy;
  let jwtStoreUsername: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateUserComponent ],
      providers: [
        JWTStore,
        FormBuilder,
        UserService,
        AuthService
      ],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        ReactiveFormsModule,
        FormsModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    const router = TestBed.inject(Router);
    routerSpy = spyOn(router, 'navigate');

    const jwtStore = TestBed.inject(JWTStore);
    jwtStoreUsername = spyOn(jwtStore, 'getUsername');
    jwtStoreValid = spyOn(jwtStore, 'isTokenValid');

    const userService = TestBed.inject(UserService);
    userServiceCreate = spyOn(userService, 'createUpdateUser');
    userServiceGet = spyOn(userService, 'getUser');

    jwtStoreValid.and.returnValue(true);
    jwtStoreUsername.and.returnValue(USERNAME);

    userServiceGet.and.returnValue(new Observable(observable => {
      observable.error(new HttpErrorResponse({
        status: 404
      }));
    }));

    fixture = TestBed.createComponent(CreateUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const setValues = (name: string, department: string) => {
    component.name.setValue(name);
    component.department.setValue(department);
  }

  const createUserResponse = (): UserResponse => {
    return {
      username: USERNAME,
      name: NAME,
      department: DEPARTMENT,
      email: 'username@email.com',
      role: {
        id: 1,
        name: 'User',
        description: 'default role',
        singleUser: false,
        permissions: [
          {
            id: 2,
            name: 'Permission',
            description: 'default permission'
          }
        ]
      }
    };
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('entering valid data should make the form valid', (done) => {
    setValues('', '');

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.form.valid).toBeFalsy();

      setValues(NAME, DEPARTMENT);

      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(component.form.value).toBeTruthy();
        done();
      })
    })
  });

  it('#create should successfully create user', (done) => {
    component.username = USERNAME;
    setValues(NAME, DEPARTMENT);

    const expectedValue = {
      name: NAME,
      department: DEPARTMENT
    };

    userServiceCreate.and.returnValue(new Observable<UserResponse>(observer => {
      observer.next(createUserResponse());
    }));

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.form.value).toEqual(expectedValue);

      component.create();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(component.error).toBeFalsy();
        expect(userServiceCreate).toHaveBeenCalledWith(new CreateUpdateUserRequest(USERNAME, NAME, DEPARTMENT), false);
        expect(routerSpy).toHaveBeenCalledWith(['user-redirect']);
        done();
      });
    })
  });

  it('#create should throw and handle error', (done) => {
    component.username = USERNAME;
    setValues(NAME, DEPARTMENT);

    const expectedValue = {
      name: NAME,
      department: DEPARTMENT
    };

    const error: HttpErrorResponse = new HttpErrorResponse({
      error: {error: 'user_exists'}, status: 400
    });

    userServiceCreate.and.returnValue(new Observable(observer => {
      observer.error(error);
    }));

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.form.value).toEqual(expectedValue);

      component.create();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(component.error).toEqual(ErrorMappings.user_exists);
        expect(userServiceCreate).toHaveBeenCalledWith(new CreateUpdateUserRequest(USERNAME, NAME, DEPARTMENT), false);
        expect(routerSpy).not.toHaveBeenCalled();
        done();
      })
    });
  });

  it('if user exists on route to create-user, it should redirect', (done) => {
    jwtStoreValid.and.returnValue(true);
    jwtStoreUsername.and.returnValue(USERNAME);

    userServiceGet.and.returnValue(new Observable(observer => observer.next(createUserResponse())));

    component.ngOnInit();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.error).toBeFalsy();

      expect(userServiceGet).toHaveBeenCalledWith(USERNAME);
      expect(routerSpy).toHaveBeenCalledWith(['user-redirect']);
      done();
    });
  });

  it('if user exists on route to create-user, and not found occurs, it should be ok', (done) => {
    jwtStoreValid.and.returnValue(true);
    jwtStoreUsername.and.returnValue(USERNAME);

    const error: HttpErrorResponse = new HttpErrorResponse({
      status: 404
    });

    userServiceGet.and.returnValue(new Observable<UserResponse>(observer => {
      observer.error(error);
    }));

    component.ngOnInit();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.error).toBeFalsy();

      expect(userServiceGet).toHaveBeenCalledWith(USERNAME);
      expect(routerSpy).not.toHaveBeenCalledWith();
      done();
    });
  });

  it('if user exists on route to create-user, and unknown error occurs, it should be displayed', (done) => {
    jwtStoreValid.and.returnValue(true);
    jwtStoreUsername.and.returnValue(USERNAME);

    const error: HttpErrorResponse = new HttpErrorResponse({
      error: {error: 'unknown'}, status: 400
    });

    userServiceGet.and.returnValue(new Observable<UserResponse>(observer => {
      observer.error(error);
    }));

    component.ngOnInit();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.error).toBeTruthy();

      expect(userServiceGet).toHaveBeenCalledWith(USERNAME);
      expect(routerSpy).not.toHaveBeenCalled();
      done();
    });
  });

  it('if JWT token is invalid on route to create-user, redirect to login', (done) => {
    jwtStoreValid.and.returnValue(false);

    component.ngOnInit();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.error).toBeFalsy();
      expect(routerSpy).toHaveBeenCalledWith(['user-redirect']);
      done();
    });
  });

  it('if JWT username is null on route to create-user, redirect to login', (done) => {
    jwtStoreValid.and.returnValue(true);
    jwtStoreUsername.and.returnValue(null);

    component.ngOnInit();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.error).toBeFalsy();
      expect(routerSpy).toHaveBeenCalledWith(['logout'], {
        queryParams: {
          sessionTimeout: true
        }
      });
      done();
    });
  });
});
