import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UserContext } from '../../../users/usercontext';
import { UserService } from '../../../users/user.service';
import { ApplicationTemplateService } from '../../application-template.service';
import { ApplicationService } from '../../application.service';
import { ApplicationContext } from '../../applicationcontext';

import { ApplicationDisplayComponent } from './application-display.component';
import { AuthService } from '../../../authentication/auth.service';
import { createUser } from '../../../testing/fakes';
import { Observable } from 'rxjs';
import { User } from '../../../users/user';
import { AuthorizationService } from '../../../users/authorization.service';
import { ReactiveFormsModule } from '@angular/forms';
import { FilesService } from '../../../files/files.service';
import { AnswerRequestService } from '../../answer-request.service';

describe('ApplicationDisplayComponent', () => {
  let component: ApplicationDisplayComponent;
  let fixture: ComponentFixture<ApplicationDisplayComponent>;

  beforeEach(() => {
    const userContextSpy = jasmine.createSpyObj('UserContext', ['getUser']);
    userContextSpy.getUser.and.returnValue(new Observable<User>(observer => {
      observer.next(createUser());
      observer.complete();
    }));
    
    TestBed.configureTestingModule({
      declarations: [ ApplicationDisplayComponent ],
      providers: [
        ApplicationTemplateService,
        ApplicationService,
        UserService,
        AuthService,
        ApplicationContext,
        {provide: UserContext, useValue: userContextSpy},
        AuthorizationService,
        FilesService,
        AnswerRequestService
      ],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        ReactiveFormsModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
