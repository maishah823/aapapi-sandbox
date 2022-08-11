import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReidComponent } from './reid.component';

describe('ReidComponent', () => {
  let component: ReidComponent;
  let fixture: ComponentFixture<ReidComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReidComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
