import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { JWTStore } from '../jwtstore';

import { LogoutComponent } from './logout.component';

describe('LogoutComponent', () => {
  let component: LogoutComponent;
  let fixture: ComponentFixture<LogoutComponent>;
  let routerSpy: jasmine.Spy;
  let jwtStoreSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ LogoutComponent ],
      providers: [
        JWTStore
      ],
      imports: [
        RouterTestingModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LogoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const router = TestBed.inject(Router);
    routerSpy = spyOn(router, 'navigate');

    const jwtStore = TestBed.inject(JWTStore);
    jwtStoreSpy = spyOn(jwtStore, 'destroyToken');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it ('should destroy token and navigate to login', () => {
    component.ngOnInit();

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(jwtStoreSpy).toHaveBeenCalled();
      expect(routerSpy).toHaveBeenCalledWith(['login']);
    })
  })
});
