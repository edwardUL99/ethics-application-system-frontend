import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, inject } from '@angular/core/testing';
import { USERNAME, EMAIL, NAME, DEPARTMENT, ROLE, createUser, createUserResponse } from '../testing/fakes';
import { AuthService } from '../authentication/auth.service';
import { CreateUpdateUserRequest } from './createupdateuserrequest';
import { UserResponse } from './responses/userresponse';
import { UserResponseShortened } from './responses/userresponseshortened';
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

  it('#getAllUsers should return list of responses', (done) => {
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
      done();
    });

    const req = httpTestingController.expectOne('/api/users/');
    expect(req.request.method).toEqual('GET');
    
    req.flush(expectedResponse);
  });

  it('#getAllUsers should return list of responses with specified permission', (done) => {
    const response: UserResponseShortened[] = [] 
    response.push({
      username: USERNAME,
      email: EMAIL,
      name: NAME,
      department: DEPARTMENT,
      role: ROLE.name
    });

    const expectedResponse: UserResponseShortened[] = response;

    service.getAllUsers('CREATE_APPLICATION').subscribe(data => {
      expect(data.length).toBe(1);
      expect(data).toBe(response);
      done();
    });

    const req = httpTestingController.expectOne('/api/users?permission=CREATE_APPLICATION');
    expect(req.request.method).toEqual('GET');
    
    req.flush(expectedResponse);
  });

  it('#getUser should return user by username', (done) => {
    const expectedResponse: UserResponse = createUserResponse();

    service.getUser(USERNAME, false).subscribe(data => {
      expect(data.error).toBe(undefined);
      expect(data.message).toBe(undefined);
      expect(data.username).toBe(USERNAME);
      expect(data.name).toBe(NAME);
      expect(data.email).toBe(EMAIL);
      expect(data.department).toBe(DEPARTMENT);
      expect(data.role).toBe(expectedResponse.role);
      done();
    });

    const req = httpTestingController.expectOne(`/api/users/user?username=${USERNAME}&email=false`);
    expect(req.request.method).toEqual('GET');

    req.flush(expectedResponse);
  });

  it('#getUser should return user by email', (done) => {
    const expectedResponse: UserResponse = createUserResponse();

    service.getUser(EMAIL, true).subscribe(data => {
      expect(data.error).toBe(undefined);
      expect(data.message).toBe(undefined);
      expect(data.username).toBe(USERNAME);
      expect(data.name).toBe(NAME);
      expect(data.email).toBe(EMAIL);
      expect(data.department).toBe(DEPARTMENT);
      expect(data.role).toBe(expectedResponse.role);
      done();
    });

    const req = httpTestingController.expectOne(`/api/users/user?username=${EMAIL}&email=true`);
    expect(req.request.method).toEqual('GET');

    req.flush(expectedResponse);
  });

  it('#createUpdateUser should create user', (done) => {
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
      done();
    });

    const req = httpTestingController.expectOne('/api/users/user/');
    expect(req.request.method).toEqual('POST');

    req.flush(expectedResponse);
  });

  it('#createUpdateUser should update user', (done) => {
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
      done();
    });

    const req = httpTestingController.expectOne('/api/users/user/');
    expect(req.request.method).toEqual('PUT');

    req.flush(expectedResponse);
  });

  it('#createUpdateUserAdmin should create user admin', (done) => {
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
      done();
    });

    const req = httpTestingController.expectOne('/api/users/admin/user/');
    expect(req.request.method).toEqual('POST');

    req.flush(expectedResponse);
  });

  it('#createUpdateUserAdmin should update user admin', (done) => {
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
      done();
    });

    const req = httpTestingController.expectOne('/api/users/admin/user/');
    expect(req.request.method).toEqual('PUT');

    req.flush(expectedResponse);
  });

  it('#updateUserRole should update user role', (done) => {
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
      done();
    });

    const req = httpTestingController.expectOne('/api/users/user/role/');
    expect(req.request.method).toEqual('PUT');

    req.flush(expectedResponse);
  });

  it('#getRoles should return roles', (done) => {
    const response: GetAuthorizationResponse<RoleResponse> = {
      authorizations: [createUserResponse().role]
    };

    service.getRoles().subscribe(data => {
      expect(data.message).toBe(undefined);
      expect(data.error).toBe(undefined);
      expect(data.authorizations.length).toBe(1);
      expect(data.authorizations[0]).toBe(response.authorizations[0]);
      done();
    });

    const req = httpTestingController.expectOne('/api/users/roles/');
    expect(req.request.method).toEqual('GET');

    req.flush(response);
  });

  it('#getPermissions should return permissions', (done) => {
    const response: GetAuthorizationResponse<PermissionResponse> = {
      authorizations: [createUserResponse().role.permissions[0]]
    };

    service.getPermissions().subscribe(data => {
      expect(data.message).toBe(undefined);
      expect(data.error).toBe(undefined);
      expect(data.authorizations.length).toBe(1);
      expect(data.authorizations[0]).toBe(response.authorizations[0]);
      done();
    });

    const req = httpTestingController.expectOne('/api/users/permissions/');
    expect(req.request.method).toEqual('GET');

    req.flush(response);
  });

  it('#loadUser should load user by username', (done) => {
    const user: User = createUser();

    const userResponse: UserResponse = createUserResponse();

    service.loadUser(USERNAME, false).subscribe(data => {
      expect(data).toEqual(user);
      done();
    });

    const req = httpTestingController.expectOne(`/api/users/user?username=${USERNAME}&email=false`);
    expect(req.request.method).toEqual('GET');

    req.flush(userResponse);
  });

  it('#loadUser should load user by email', (done) => {
    const user: User = createUser();

    const userResponse: UserResponse = createUserResponse();

    service.loadUser(EMAIL, true).subscribe(data => {
      expect(data).toEqual(user);
      done();
    });

    const req = httpTestingController.expectOne(`/api/users/user?username=${EMAIL}&email=true`);
    expect(req.request.method).toEqual('GET');

    req.flush(userResponse);
  });
});
