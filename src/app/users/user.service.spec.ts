import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, inject } from '@angular/core/testing';
import { Account } from '../authentication/account';
import { AuthService } from '../authentication/auth.service';
import { CreateUpdateUserRequest } from './createupdateuserrequest';
import { Permission } from './permission';
import { UserResponse } from './responses/userresponse';
import { UserResponseShortened } from './responses/userresponseshortened';
import { Role } from './role';
import { RoleResponse } from './responses/roleresponse';
import { PermissionResponse } from './responses/permissionresponse';
import { GetAuthorizationResponse } from './responses/getauthorizationresponse';
import { User } from './user';
import { UserService } from './user.service';
import { UpdateRoleRequest } from './updaterolerequest';
import { Observable } from 'rxjs';
import { AccountResponse } from '../authentication/accountresponse';

describe('UserService', () => {
  let service: UserService;
  let httpTestingController: HttpTestingController;
  let authService: AuthService;

  const USERNAME = "username";
  const EMAIL = "test@email.com";
  const NAME = "name";
  const ACCOUNT = new Account(USERNAME, EMAIL, null, true);
  const DEPARTMENT = "department";
  const ROLE = new Role(1, 'User', 'default role', [new Permission(2, 'permission', 'default permission')], false);

  const createUser = () => {
    return new User(USERNAME, NAME, ACCOUNT, DEPARTMENT, ROLE);
  }

  beforeEach(() => {
    const accountResponse: AccountResponse = {
      username: USERNAME,
      email: EMAIL,
      confirmed: true
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UserService,
        { provide: AuthService, useValue: jasmine.createSpyObj('AuthService', {getAccount: new Observable<AccountResponse>(observer => {
          observer.next(accountResponse);
        })})}
      ]
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(UserService);
    authService = TestBed.inject(AuthService);
  });

  it('should be created', inject([UserService], (service: UserService) => {
    expect(service).toBeTruthy();
  }));

  it('#getAllUsers should return list of responses', () => {
    const response: UserResponseShortened = {
      username: USERNAME,
      email: EMAIL,
      name: NAME,
      department: DEPARTMENT,
      role: ROLE.name
    };

    const expectedResponse: UserResponseShortened[] = [response];

    service.getAllUsers().subscribe(data => {
      expect(data.length).toBe(1);
      expect(data[0]).toBe(response);
    });

    const req = httpTestingController.expectOne('/api/users/');
    expect(req.request.method).toEqual('GET');
    
    req.flush(expectedResponse);
  });

  const createUserResponse = (): UserResponse => {
    return {
      username: USERNAME,
      email: EMAIL,
      name: NAME,
      department: DEPARTMENT,
      role: {
        id: 1,
        permissions: [
          {
            id: 2,
            name: 'permission',
            description: 'default permission'
          }
        ],
        name: 'User',
        description: 'default role',
        singleUser: false
      }
    }
  }

  it('#getUser should return user by username', () => {
    const expectedResponse: UserResponse = createUserResponse();

    service.getUser(USERNAME, false).subscribe(data => {
      expect(data.error).toBe(undefined);
      expect(data.message).toBe(undefined);
      expect(data.username).toBe(USERNAME);
      expect(data.name).toBe(NAME);
      expect(data.email).toBe(EMAIL);
      expect(data.department).toBe(DEPARTMENT);
      expect(data.role).toBe(expectedResponse.role);
    });

    const req = httpTestingController.expectOne(`/api/users/user?username=${USERNAME}&email=false`);
    expect(req.request.method).toEqual('GET');

    req.flush(expectedResponse);
  });

  it('#getUser should return user by email', () => {
    const expectedResponse: UserResponse = createUserResponse();

    service.getUser(EMAIL, true).subscribe(data => {
      expect(data.error).toBe(undefined);
      expect(data.message).toBe(undefined);
      expect(data.username).toBe(USERNAME);
      expect(data.name).toBe(NAME);
      expect(data.email).toBe(EMAIL);
      expect(data.department).toBe(DEPARTMENT);
      expect(data.role).toBe(expectedResponse.role);
    });

    const req = httpTestingController.expectOne(`/api/users/user?username=${EMAIL}&email=true`);
    expect(req.request.method).toEqual('GET');

    req.flush(expectedResponse);
  });

  it('#createUpdateUser should create user', () => {
    const expectedResponse: UserResponse = createUserResponse();

    const request: CreateUpdateUserRequest = new CreateUpdateUserRequest(USERNAME, NAME, DEPARTMENT);

    service.createUpdateUser(request, false).subscribe(data => {
      expect(data.error).toBe(undefined);
      expect(data.message).toBe(undefined);
      expect(data.username).toBe(USERNAME);
      expect(data.name).toBe(NAME);
      expect(data.email).toBe(EMAIL);
      expect(data.department).toBe(DEPARTMENT);
      expect(data.role).toBe(expectedResponse.role);
    });

    const req = httpTestingController.expectOne('/api/users/user/');
    expect(req.request.method).toEqual('POST');

    req.flush(expectedResponse);
  });

  it('#createUpdateUser should update user', () => {
    const expectedResponse: UserResponse = createUserResponse();

    const request: CreateUpdateUserRequest = new CreateUpdateUserRequest(USERNAME, NAME, DEPARTMENT);

    service.createUpdateUser(request, true).subscribe(data => {
      expect(data.error).toBe(undefined);
      expect(data.message).toBe(undefined);
      expect(data.username).toBe(USERNAME);
      expect(data.name).toBe(NAME);
      expect(data.email).toBe(EMAIL);
      expect(data.department).toBe(DEPARTMENT);
      expect(data.role).toBe(expectedResponse.role);
    });

    const req = httpTestingController.expectOne('/api/users/user/');
    expect(req.request.method).toEqual('PUT');

    req.flush(expectedResponse);
  });

  it('#createUpdateUserAdmin should create user admin', () => {
    const expectedResponse: UserResponse = createUserResponse();

    const request: CreateUpdateUserRequest = new CreateUpdateUserRequest(USERNAME, NAME, DEPARTMENT);

    service.createUpdateUserAdmin(request, false).subscribe(data => {
      expect(data.error).toBe(undefined);
      expect(data.message).toBe(undefined);
      expect(data.username).toBe(USERNAME);
      expect(data.name).toBe(NAME);
      expect(data.email).toBe(EMAIL);
      expect(data.department).toBe(DEPARTMENT);
      expect(data.role).toBe(expectedResponse.role);
    });

    const req = httpTestingController.expectOne('/api/users/admin/user/');
    expect(req.request.method).toEqual('POST');

    req.flush(expectedResponse);
  });

  it('#createUpdateUserAdmin should update user admin', () => {
    const expectedResponse: UserResponse = createUserResponse();

    const request: CreateUpdateUserRequest = new CreateUpdateUserRequest(USERNAME, NAME, DEPARTMENT);

    service.createUpdateUserAdmin(request, true).subscribe(data => {
      expect(data.error).toBe(undefined);
      expect(data.message).toBe(undefined);
      expect(data.username).toBe(USERNAME);
      expect(data.name).toBe(NAME);
      expect(data.email).toBe(EMAIL);
      expect(data.department).toBe(DEPARTMENT);
      expect(data.role).toBe(expectedResponse.role);
    });

    const req = httpTestingController.expectOne('/api/users/admin/user/');
    expect(req.request.method).toEqual('PUT');

    req.flush(expectedResponse);
  });

  it('#updateUserRole should update user role', () => {
    const expectedResponse: UserResponse = createUserResponse();

    const request: UpdateRoleRequest = new UpdateRoleRequest(USERNAME, expectedResponse.role.id);

    service.updateUserRole(request).subscribe(data => {
      expect(data.error).toBe(undefined);
      expect(data.message).toBe(undefined);
      expect(data.username).toBe(USERNAME);
      expect(data.name).toBe(NAME);
      expect(data.email).toBe(EMAIL);
      expect(data.department).toBe(DEPARTMENT);
      expect(data.role).toBe(expectedResponse.role);
    });

    const req = httpTestingController.expectOne('/api/users/user/role/');
    expect(req.request.method).toEqual('PUT');

    req.flush(expectedResponse);
  });

  it('#getRoles should return roles', () => {
    const response: GetAuthorizationResponse<RoleResponse> = {
      authorizations: [createUserResponse().role]
    };

    service.getRoles().subscribe(data => {
      expect(data.message).toBe(undefined);
      expect(data.error).toBe(undefined);
      expect(data.authorizations.length).toBe(1);
      expect(data.authorizations[0]).toBe(response.authorizations[0]);
    });

    const req = httpTestingController.expectOne('/api/users/roles/');
    expect(req.request.method).toEqual('GET');

    req.flush(response);
  });

  it('#getPermissions should return permissions', () => {
    const response: GetAuthorizationResponse<PermissionResponse> = {
      authorizations: [createUserResponse().role.permissions[0]]
    };

    service.getPermissions().subscribe(data => {
      expect(data.message).toBe(undefined);
      expect(data.error).toBe(undefined);
      expect(data.authorizations.length).toBe(1);
      expect(data.authorizations[0]).toBe(response.authorizations[0]);
    });

    const req = httpTestingController.expectOne('/api/users/permissions/');
    expect(req.request.method).toEqual('GET');

    req.flush(response);
  });

  it('#loadUser should load user by username', () => {
    const user: User = createUser();

    const userResponse: UserResponse = createUserResponse();

    service.loadUser(USERNAME, false).subscribe(data => {
      expect(data).toEqual(user);
    });

    const req = httpTestingController.expectOne(`/api/users/user?username=${USERNAME}&email=false`);
    expect(req.request.method).toEqual('GET');

    req.flush(userResponse);
  });

  it('#loadUser should load user by email', () => {
    const user: User = createUser();

    const userResponse: UserResponse = createUserResponse();

    service.loadUser(EMAIL, true).subscribe(data => {
      expect(data).toEqual(user);
    });

    const req = httpTestingController.expectOne(`/api/users/user?username=${EMAIL}&email=true`);
    expect(req.request.method).toEqual('GET');

    req.flush(userResponse);
  });
});
