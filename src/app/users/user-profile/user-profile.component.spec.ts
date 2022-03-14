import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';
import { AuthService } from '../../authentication/auth.service';

import { createUser } from '../../testing/fakes';
import { User } from '../user';
import { UserService } from '../user.service';
import { UserContext } from '../usercontext';
import { UserProfileComponent } from './user-profile.component';
import { AuthorizationService } from '../authorization.service';
import { ReactiveFormsModule } from '@angular/forms';

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;

  beforeEach(async () => {
    const userContextSpy = jasmine.createSpyObj('UserContext', ['getUser', 'getUsername', 'getName', 'subscribeToUpdates']);
    userContextSpy.getUser.and.returnValue(new Observable<User>(observer => {
      observer.next(createUser());
      observer.complete();
    }));

    await TestBed.configureTestingModule({
      declarations: [ UserProfileComponent ],
      providers: [
        AuthService,
        UserService,
        AuthorizationService,
        {provide: UserContext, useValue: userContextSpy}
      ],
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
