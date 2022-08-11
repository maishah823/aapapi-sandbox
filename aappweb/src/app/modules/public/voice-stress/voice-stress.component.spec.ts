import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VoiceStressComponent } from './voice-stress.component';

describe('VoiceStressComponent', () => {
  let component: VoiceStressComponent;
  let fixture: ComponentFixture<VoiceStressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VoiceStressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VoiceStressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
