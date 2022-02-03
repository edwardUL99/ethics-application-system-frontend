import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { JWTStore } from '../../authentication/jwtstore';
import { Account } from '../../authentication/account';
import { UserService } from '../user.service';

import { UserRedirectComponent } from './user-redirect.component';
import { Role } from '../role';
import { Permission } from '../permission';
import { Router } from '@angular/router';
import { User } from '../user';
import { Observable } from 'rxjs';
import { AuthService } from '../../authentication/auth.service';

describe('UserRedirectComponent', () => {
  let component: UserRedirectComponent;
  let fixture: ComponentFixture<UserRedirectComponent>;
  let routerSpy: jasmine.Spy;
  let jwtStoreValid: jasmine.Spy;
  let jwtStoreUsername: jasmine.Spy;
  let userServiceSpy: jasmine.Spy;

  const USERNAME = 'username';
  const EMAIL = 'email';
  const NAME = 'name';
  const DEPARTMENT = 'department';
  const ACCOUNT = new Account(USERNAME, EMAIL, null, true);
  const ROLE = new Role(1, 'User', 'default role',
    [new Permission(2, 'Permission', 'default permission')], false);

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ UserRedirectComponent ],
      providers: [
        UserService,
        JWTStore,
        AuthService  
      ],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const router = TestBed.inject(Router);
    routerSpy = spyOn(router, 'navigate');

    const jwtStore = TestBed.inject(JWTStore);
    jwtStoreValid = spyOn(jwtStore, 'isTokenValid');
    jwtStoreUsername = spyOn(jwtStore, 'getUsername');
    
    const userService = TestBed.inject(UserService);
    userServiceSpy = spyOn(userService, 'loadUser');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  const createUser = (): User => {
    return new User(USERNAME, NAME, ACCOUNT, DEPARTMENT, ROLE);
  }

  it('#redirectPostLogin should redirect to home if user exists', fakeAsync(() => {
    jwtStoreValid.and.returnValue(true);
    jwtStoreUsername.and.returnValue(USERNAME);

    userServiceSpy.and.returnValue(new Observable<User>(observer => {
      observer.next(createUser());
    }));

    component.ngOnInit();
    tick();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(userServiceSpy).toHaveBeenCalledWith(USERNAME, false);
      expect(component.error).toBeFalsy();
      expect(routerSpy).toHaveBeenCalledWith(['home']);
    })
  }));

  it('#redirectPostLogin should redirect to create-user if user does not exist', fakeAsync(() => {
    jwtStoreValid.and.returnValue(true);
    jwtStoreUsername.and.returnValue(USERNAME);

    userServiceSpy.and.returnValue(new Observable<User>(observer => {
      observer.error('404-User');
    }));

    component.ngOnInit();
    tick();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(userServiceSpy).toHaveBeenCalledWith(USERNAME, false);
      expect(component.error).toBeFalsy();
      expect(routerSpy).toHaveBeenCalledWith(['create-user']);
    })
  }));

  it('#redirectPostLogin should throw error if load user fails', fakeAsync(() => {
    jwtStoreValid.and.returnValue(true);
    jwtStoreUsername.and.returnValue(USERNAME);

    userServiceSpy.and.returnValue(new Observable<User>(observer => {
      observer.error('unknown error');
    }));

    component.ngOnInit();
    tick();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(userServiceSpy).toHaveBeenCalledWith(USERNAME, false);
      expect(component.error).toBeTruthy();
      expect(routerSpy).not.toHaveBeenCalled();
    })
  }));

  it('should redirect to login if not authenticated', () => {
    jwtStoreValid.and.returnValue(false);

    component.ngOnInit();

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(userServiceSpy).not.toHaveBeenCalled();
      expect(component.error).toBeFalsy();
      expect(routerSpy).toHaveBeenCalledWith(['login']);
    })
  });
});
