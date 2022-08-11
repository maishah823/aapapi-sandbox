import { TestBed, inject } from '@angular/core/testing';

import { ScheduleAddService } from './schedule-add.service';

describe('ScheduleAddService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ScheduleAddService]
    });
  });

  it('should be created', inject([ScheduleAddService], (service: ScheduleAddService) => {
    expect(service).toBeTruthy();
  }));
});
