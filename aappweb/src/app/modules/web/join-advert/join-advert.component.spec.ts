import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinAdvertComponent } from './join-advert.component';

describe('JoinAdvertComponent', () => {
  let component: JoinAdvertComponent;
  let fixture: ComponentFixture<JoinAdvertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JoinAdvertComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JoinAdvertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
