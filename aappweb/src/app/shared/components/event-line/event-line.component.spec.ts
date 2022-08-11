import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventLineComponent } from './event-line.component';

describe('EventLineComponent', () => {
  let component: EventLineComponent;
  let fixture: ComponentFixture<EventLineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventLineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
