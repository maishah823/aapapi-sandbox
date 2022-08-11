import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PastPresidentsComponent } from './past-presidents.component';

describe('PastPresidentsComponent', () => {
  let component: PastPresidentsComponent;
  let fixture: ComponentFixture<PastPresidentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PastPresidentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PastPresidentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
