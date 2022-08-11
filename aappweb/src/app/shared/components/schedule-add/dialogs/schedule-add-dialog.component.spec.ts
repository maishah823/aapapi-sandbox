import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleAddDialogComponent } from './schedule-add-dialog.component';

describe('ScheduleAddDialogComponent', () => {
  let component: ScheduleAddDialogComponent;
  let fixture: ComponentFixture<ScheduleAddDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduleAddDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleAddDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
