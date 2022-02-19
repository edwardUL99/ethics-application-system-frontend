import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';
import { UserContext } from 'src/app/users/usercontext';
import { JWTStore } from '../jwtstore';

import { LogoutComponent } from './logout.component';

describe('LogoutComponent', () => {
  let component: LogoutComponent;
  let fixture: ComponentFixture<LogoutComponent>;
  let routerSpy: jasmine.Spy;
  let jwtStoreSpy: jasmine.Spy;
  let userContextSpy: jasmine.Spy;
  let route: ActivatedRoute;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ LogoutComponent ],
      providers: [
        JWTStore,
        UserContext
      ],
      imports: [
        RouterTestingModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    route = TestBed.inject(ActivatedRoute);
    route.queryParams = new Observable(observer => observer.next({}));

    fixture = TestBed.createComponent(LogoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const router = TestBed.inject(Router);
    routerSpy = spyOn(router, 'navigate');

    const jwtStore = TestBed.inject(JWTStore);
    jwtStoreSpy = spyOn(jwtStore, 'destroyToken');

    const userContext: UserContext = TestBed.inject(UserContext);
    userContextSpy = spyOn(userContext, 'clearContext');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should destroy token and navigate to login', (done) => {
    component.ngOnInit();

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(jwtStoreSpy).toHaveBeenCalled();
      expect(routerSpy).toHaveBeenCalledWith(['login'], {});
      expect(userContextSpy).toHaveBeenCalled();
      done();
    })
  });

  it('should redirect to login with sessionTimeout', (done) => {
    route.queryParams = new Observable(observer => observer.next({sessionTimeout: true}));

    component.ngOnInit();

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(routerSpy).toHaveBeenCalledWith(['login'], {
        queryParams: {
          sessionTimeout: true
        }
      });
      expect(userContextSpy).toHaveBeenCalled();
      done();
    })
  })
});
