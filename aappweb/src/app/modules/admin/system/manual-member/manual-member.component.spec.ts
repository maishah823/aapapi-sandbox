import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualMemberComponent } from './manual-member.component';

describe('ManualMemberComponent', () => {
  let component: ManualMemberComponent;
  let fixture: ComponentFixture<ManualMemberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManualMemberComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
