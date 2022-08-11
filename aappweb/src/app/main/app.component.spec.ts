import { TestBed, async } from '@angular/core/testing';
import {RouterModule} from '@angular/router';
import { AppComponent } from './app.component';
import { APP_BASE_HREF } from '@angular/common';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[RouterModule],
      declarations: [
        AppComponent
      ],
      providers:[]
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
  
});
