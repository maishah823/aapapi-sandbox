import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolsAdminComponent } from './schools-admin.component';

describe('SchoolsAdminComponent', () => {
  let component: SchoolsAdminComponent;
  let fixture: ComponentFixture<SchoolsAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchoolsAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchoolsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
