import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NeedsConfirmationComponent } from './needs-confirmation.component';

describe('NeedsConfirmationComponent', () => {
  let component: NeedsConfirmationComponent;
  let fixture: ComponentFixture<NeedsConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NeedsConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NeedsConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
