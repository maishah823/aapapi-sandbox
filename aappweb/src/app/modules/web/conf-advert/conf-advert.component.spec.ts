import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfAdvertComponent } from './conf-advert.component';

describe('ConfAdvertComponent', () => {
  let component: ConfAdvertComponent;
  let fixture: ComponentFixture<ConfAdvertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfAdvertComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfAdvertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
