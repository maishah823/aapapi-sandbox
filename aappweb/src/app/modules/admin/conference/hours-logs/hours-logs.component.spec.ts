import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoursLogsComponent } from './hours-logs.component';

describe('HoursLogsComponent', () => {
  let component: HoursLogsComponent;
  let fixture: ComponentFixture<HoursLogsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoursLogsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoursLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
