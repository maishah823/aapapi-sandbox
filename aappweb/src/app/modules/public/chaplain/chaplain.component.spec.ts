import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChaplainComponent } from './chaplain.component';

describe('ChaplainComponent', () => {
  let component: ChaplainComponent;
  let fixture: ComponentFixture<ChaplainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChaplainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChaplainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
