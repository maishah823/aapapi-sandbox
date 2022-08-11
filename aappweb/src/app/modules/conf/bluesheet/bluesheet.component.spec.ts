import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BluesheetComponent } from './bluesheet.component';

describe('BluesheetComponent', () => {
  let component: BluesheetComponent;
  let fixture: ComponentFixture<BluesheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BluesheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BluesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
