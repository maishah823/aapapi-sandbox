import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfInfoComponent } from './conf-info.component';

describe('ConfInfoComponent', () => {
  let component: ConfInfoComponent;
  let fixture: ComponentFixture<ConfInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
