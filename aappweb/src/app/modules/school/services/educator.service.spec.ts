import { TestBed, inject } from '@angular/core/testing';

import { EducatorService } from './educator.service';

describe('EducatorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EducatorService]
    });
  });

  it('should be created', inject([EducatorService], (service: EducatorService) => {
    expect(service).toBeTruthy();
  }));
});
