import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfStartComponent } from './conf-start.component';

describe('ConfStartComponent', () => {
  let component: ConfStartComponent;
  let fixture: ComponentFixture<ConfStartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfStartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfStartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
