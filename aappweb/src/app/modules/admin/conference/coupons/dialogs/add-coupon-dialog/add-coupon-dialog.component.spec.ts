import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCouponDialogComponent } from './add-coupon-dialog.component';

describe('AddCouponDialogComponent', () => {
  let component: AddCouponDialogComponent;
  let fixture: ComponentFixture<AddCouponDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCouponDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCouponDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
