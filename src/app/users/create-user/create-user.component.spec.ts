import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { observable, Observable } from 'rxjs';
import { AuthService } from '../../authentication/auth.service';
import { JWTStore } from '../../authentication/jwtstore';
import { CreateUpdateUserRequest } from '../createupdateuserrequest';
import { UserResponse } from '../responses/userresponse';
import { UserService } from '../user.service';

import { ErrorMappings } from '../../mappings';

import { CreateUserComponent } from './create-user.component';
import { notDeepEqual } from 'assert';

describe('CreateUserComponent', () => {
  let component: CreateUserComponent;
  let fixture: ComponentFixture<CreateUserComponent>;
  let userServiceGet: jasmine.Spy;
  let userServiceCreate: jasmine.Spy;
  let routerSpy: jasmine.Spy;
  let jwtStoreValid: jasmine.Spy;
  let jwtStoreUsername: jasmine.Spy;

  const USERNAME = 'username';
  const NAME = 'name';
  const DEPARTMENT = 'department';

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

  it('entering valid data should make the form valid', () => {
    setValues('', '');

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.form.valid).toBeFalsy();

      setValues(NAME, DEPARTMENT);

      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(component.form.value).toBeTruthy();
      })
    })
  });

  it('#create should successfully create user', fakeAsync(() => {
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
      tick();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(component.error).toBeFalsy();
        expect(userServiceCreate).toHaveBeenCalledWith(new CreateUpdateUserRequest(USERNAME, NAME, DEPARTMENT), false);
        expect(routerSpy).toHaveBeenCalledWith(['user-redirect']);
      });
    })
  }));

  it('#create should throw and handle error', fakeAsync(() => {
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
      tick();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(component.error).toEqual(ErrorMappings.user_exists);
        expect(userServiceCreate).toHaveBeenCalledWith(new CreateUpdateUserRequest(USERNAME, NAME, DEPARTMENT), false);
        expect(routerSpy).not.toHaveBeenCalled();
      })
    });
  }));

  it('if user exists on route to create-user, it should redirect', fakeAsync(() => {
    jwtStoreValid.and.returnValue(true);
    jwtStoreUsername.and.returnValue(USERNAME);

    userServiceGet.and.returnValue(new Observable(observer => observer.next(createUserResponse())));

    component.ngOnInit();
    tick();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.error).toBeFalsy();

      expect(userServiceGet).toHaveBeenCalledWith(USERNAME);
      expect(routerSpy).toHaveBeenCalledWith(['user-redirect']);
    });
  }));

  it('if user exists on route to create-user, and not found occurs, it should be ok', fakeAsync(() => {
    jwtStoreValid.and.returnValue(true);
    jwtStoreUsername.and.returnValue(USERNAME);

    const error: HttpErrorResponse = new HttpErrorResponse({
      status: 404
    });

    userServiceGet.and.returnValue(new Observable<UserResponse>(observer => {
      observer.error(error);
    }));

    component.ngOnInit();
    tick();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.error).toBeFalsy();

      expect(userServiceGet).toHaveBeenCalledWith(USERNAME);
      expect(routerSpy).not.toHaveBeenCalledWith();
    });
  }));

  it('if user exists on route to create-user, and unknown error occurs, it should be displayed', fakeAsync(() => {
    jwtStoreValid.and.returnValue(true);
    jwtStoreUsername.and.returnValue(USERNAME);

    const error: HttpErrorResponse = new HttpErrorResponse({
      error: {error: 'unknown'}, status: 400
    });

    userServiceGet.and.returnValue(new Observable<UserResponse>(observer => {
      observer.error(error);
    }));

    component.ngOnInit();
    tick();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.error).toBeTruthy();

      expect(userServiceGet).toHaveBeenCalledWith(USERNAME);
      expect(routerSpy).not.toHaveBeenCalled();
    });
  }));

  it('if JWT token is invalid on route to create-user, redirect to login', () => {
    jwtStoreValid.and.returnValue(false);

    component.ngOnInit();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.error).toBeFalsy();
      expect(routerSpy).toHaveBeenCalledWith(['logout']);
    });
  });

  it('if JWT username is null on route to create-user, redirect to login', () => {
    jwtStoreValid.and.returnValue(true);
    jwtStoreUsername.and.returnValue(null);

    component.ngOnInit();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.error).toBeFalsy();
      expect(routerSpy).toHaveBeenCalledWith(['logout']);
    });
  });
});
