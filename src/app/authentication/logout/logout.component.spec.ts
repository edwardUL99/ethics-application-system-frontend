import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';
import { UserService } from '../../users/user.service';
import { CacheManager } from '../../caching/cachemanager';
import { UserContext } from '../../users/usercontext';
import { AuthService } from '../auth.service';
import { JWTStore } from '../jwtstore';

import { LogoutComponent } from './logout.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

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
        {provide: UserService, useClass: jasmine.createSpy('UserService')},
        UserContext,
        CacheManager
      ],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule
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
      expect(routerSpy).toHaveBeenCalledWith(['login'], {queryParamsHandling: 'merge'});
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
        queryParamsHandling: 'merge'
      });
      expect(userContextSpy).toHaveBeenCalled();
      done();
    })
  })
});
