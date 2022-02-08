import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserContext } from '../users/usercontext';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { NavbarComponent } from './navbar.component';
import { UserService } from '../users/user.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from '../authentication/auth.service';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ NavbarComponent ],
      providers: [
        AuthService,
        UserService,
        UserContext,
        NgbModal
      ],
      imports: [
        HttpClientTestingModule
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
