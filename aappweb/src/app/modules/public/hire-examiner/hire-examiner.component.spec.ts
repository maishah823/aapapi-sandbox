import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HireExaminerComponent } from './hire-examiner.component';

describe('HireExaminerComponent', () => {
  let component: HireExaminerComponent;
  let fixture: ComponentFixture<HireExaminerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HireExaminerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HireExaminerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
