import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IeComponent } from './ie.component';

describe('IeComponent', () => {
  let component: IeComponent;
  let fixture: ComponentFixture<IeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
