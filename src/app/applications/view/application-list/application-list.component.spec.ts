import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ApplicationTemplateService } from '../../application-template.service';
import { ApplicationListComponent } from './application-list.component';
import { AuthService } from '../../../authentication/auth.service';
import { UserService } from '../../../users/user.service';
import { UserContext } from '../../../users/usercontext';
import { AuthorizationService } from '../../../users/authorization.service';
import { ApplicationService } from '../../application.service';
import { FilesService } from '../../../files/files.service';

describe('ApplicationListComponent', () => {
  let component: ApplicationListComponent;
  let fixture: ComponentFixture<ApplicationListComponent>;

  beforeEach(() => {
    const userContextSpy = jasmine.createSpyObj('UserContext', ['getUser']);

    TestBed.configureTestingModule({
      declarations: [ ApplicationListComponent ],
      providers: [
        ApplicationTemplateService,
        AuthService,
        UserService,
        {provide: UserContext, useValue: userContextSpy},
        AuthorizationService,
        ApplicationService,
        FilesService
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
