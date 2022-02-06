import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';
import { ErrorMappings } from '../../mappings';
import { AuthService } from '../auth.service';
import { USERNAME  } from '../../testing/fakes';
import { NeedsConfirmationComponent } from './needs-confirmation.component';

describe('NeedsConfirmationComponent', () => {
  let component: NeedsConfirmationComponent;
  let fixture: ComponentFixture<NeedsConfirmationComponent>;
  let authServiceSpy: jasmine.Spy;
  let route: ActivatedRoute;

  const USE_EMAIL = false;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ NeedsConfirmationComponent ],
      providers: [
        AuthService,
        {provide: ActivatedRoute, useValue: {
          queryParams: new Observable(observer => {
            observer.next({
              username: USERNAME,
              email: USE_EMAIL
            });
          })
        }}
      ],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NeedsConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const authService = TestBed.inject(AuthService);
    authServiceSpy = spyOn(authService, 'resendConfirmationEmail');

    route = TestBed.inject(ActivatedRoute);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#resendConfirmation should resend confirmation e-mail', (done) => {
    expect(component.error).toBeUndefined();
    expect(component.message).toBeUndefined();

    authServiceSpy.and.returnValue(new Observable(observer => {
      observer.next({});
    }));

    component.resendConfirmation();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.error).toBeNull();
      expect(component.message).toEqual('Confirmation E-mail re-sent');
      expect(authServiceSpy).toHaveBeenCalledWith(USERNAME, false);
      done();
    })
  });

  it('#resendConfirmation should catch and handle error', (done) => {
    expect(component.error).toBeUndefined();
    expect(component.message).toBeUndefined();

    authServiceSpy.and.returnValue(new Observable(observer => {
      observer.error(new HttpErrorResponse({
        error: {error: 'account_not_exists'}, status: 400
      }));
    }));

    component.resendConfirmation();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.error).toEqual(ErrorMappings.account_not_exists);
      expect(component.message).toBeNull();
      expect(authServiceSpy).toHaveBeenCalledWith(USERNAME, false);
      done();
    })
  });

  it('#resendConfirmation should throw error if username query param is not specified', (done) => {
    route.queryParams = new Observable(observable => {
      observable.next({})
    });

    component.resendConfirmation();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.error).toEqual('You need to specify the username of the account that needs confirmation');
      done();
    })
  });
});
