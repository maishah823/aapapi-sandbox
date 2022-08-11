import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StressTestComponent } from './stress-test.component';

describe('StressTestComponent', () => {
  let component: StressTestComponent;
  let fixture: ComponentFixture<StressTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StressTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StressTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
