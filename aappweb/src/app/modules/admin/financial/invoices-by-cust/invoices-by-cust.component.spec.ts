import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicesByCustComponent } from './invoices-by-cust.component';

describe('InvoicesByCustComponent', () => {
  let component: InvoicesByCustComponent;
  let fixture: ComponentFixture<InvoicesByCustComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoicesByCustComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoicesByCustComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
