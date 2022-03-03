import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthorizationService } from '../users/authorization.service';
import { UserService } from '../users/user.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HomeComponent } from './home.component';
import { AuthService } from '../authentication/auth.service';
import { UserContext } from '../users/usercontext';
import { EMPTY } from 'rxjs';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    const contextMock = jasmine.createSpyObj('UserContext', ['getUser']);
    contextMock.getUser.and.returnValue(EMPTY);

    await TestBed.configureTestingModule({
      declarations: [ HomeComponent ],
      providers: [
        AuthorizationService,
        UserService,
        AuthService,
        {provide: UserContext, useValue: contextMock}
      ],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
