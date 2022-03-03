import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { JWTStore } from '../../authentication/jwtstore';
import { UserService } from '../user.service';

import { USERNAME, NAME, ACCOUNT, DEPARTMENT, ROLE } from '../../testing/fakes';
import { UserRedirectComponent } from './user-redirect.component';
import { Router } from '@angular/router';
import { User } from '../user';
import { Observable } from 'rxjs';
import { AuthService } from '../../authentication/auth.service';
import { UserContext } from '../usercontext';

describe('UserRedirectComponent', () => {
  let component: UserRedirectComponent;
  let fixture: ComponentFixture<UserRedirectComponent>;
  let routerSpy: jasmine.Spy;
  let jwtStoreValid: jasmine.Spy;
  let jwtStoreUsername: jasmine.Spy;
  let userServiceSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ UserRedirectComponent ],
      providers: [
        UserService,
        JWTStore,
        AuthService,
        UserContext 
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

  it('#redirectPostLogin should redirect to home if user exists', (done) => {
    jwtStoreValid.and.returnValue(true);
    jwtStoreUsername.and.returnValue(USERNAME);

    userServiceSpy.and.returnValue(new Observable<User>(observer => {
      observer.next(createUser());
    }));

    component.ngOnInit();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(userServiceSpy).toHaveBeenCalledWith(USERNAME, false);
      expect(component.error).toBeFalsy();
      expect(routerSpy).toHaveBeenCalledWith(['home']);
      done();
    })
  });

  it('#redirectPostLogin should redirect to create-user if user does not exist', (done) => {
    jwtStoreValid.and.returnValue(true);
    jwtStoreUsername.and.returnValue(USERNAME);

    userServiceSpy.and.returnValue(new Observable<User>(observer => {
      observer.error('404-User');
    }));

    component.ngOnInit();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(userServiceSpy).toHaveBeenCalledWith(USERNAME, false);
      expect(component.error).toBeFalsy();
      expect(routerSpy).toHaveBeenCalledWith(['create-user']);
      done();
    })
  });

  it('#redirectPostLogin should throw error if load user fails', (done) => {
    jwtStoreValid.and.returnValue(true);
    jwtStoreUsername.and.returnValue(USERNAME);

    userServiceSpy.and.returnValue(new Observable<User>(observer => {
      observer.error('unknown error');
    }));

    component.ngOnInit();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(userServiceSpy).toHaveBeenCalledWith(USERNAME, false);
      expect(component.error).toBeTruthy();
      expect(routerSpy).not.toHaveBeenCalled();
      done();
    })
  });

  it('should redirect to login if not authenticated', (done) => {
    jwtStoreValid.and.returnValue(false);

    component.ngOnInit();

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(userServiceSpy).not.toHaveBeenCalled();
      expect(component.error).toBeFalsy();
      expect(routerSpy).toHaveBeenCalledWith(['logout'], {
        queryParams: {
          sessionTimeout: true
        }
      });
      done();
    })
  });
});
