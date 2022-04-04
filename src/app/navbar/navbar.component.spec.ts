import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserContext } from '../users/usercontext';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { NavbarComponent } from './navbar.component';
import { UserService } from '../users/user.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../authentication/auth.service';
import { Observable } from 'rxjs';
import { User } from '../users/user';
import { createUser } from '../testing/fakes';
import { AuthorizationService } from '../users/authorization.service';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(() => {
    const userContextSpy = jasmine.createSpyObj('UserContext', ['getUser', 'getUsername', 'getName', 'subscribeToUpdates']);
    userContextSpy.getUser.and.returnValue(new Observable<User>(observer => {
      observer.next(createUser());
      observer.complete();
    }));

    TestBed.configureTestingModule({
      declarations: [ NavbarComponent ],
      providers: [
        AuthService,
        UserService,
        {provide: UserContext, useValue: userContextSpy},
        NgbModal,
        AuthorizationService
      ],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
