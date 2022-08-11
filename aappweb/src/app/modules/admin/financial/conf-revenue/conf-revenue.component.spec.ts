import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfRevenueComponent } from './conf-revenue.component';

describe('ConfRevenueComponent', () => {
  let component: ConfRevenueComponent;
  let fixture: ComponentFixture<ConfRevenueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfRevenueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfRevenueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
