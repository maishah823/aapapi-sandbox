import { TestBed, inject } from '@angular/core/testing';

import { EventAddService } from './event-add.service';

describe('EventAddService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EventAddService]
    });
  });

  it('should be created', inject([EventAddService], (service: EventAddService) => {
    expect(service).toBeTruthy();
  }));
});
