import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomScheduleComponent } from './custom-schedule.component';

describe('CustomScheduleComponent', () => {
  let component: CustomScheduleComponent;
  let fixture: ComponentFixture<CustomScheduleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomScheduleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
