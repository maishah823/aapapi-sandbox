import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmPhoneDialogComponent } from './confirm-phone-dialog.component';

describe('ConfirmPhoneDialogComponent', () => {
  let component: ConfirmPhoneDialogComponent;
  let fixture: ComponentFixture<ConfirmPhoneDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmPhoneDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmPhoneDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
