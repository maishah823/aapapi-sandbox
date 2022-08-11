import { TestBed, inject } from '@angular/core/testing';

import { ConfServiceService } from './conf-service.service';

describe('ConfServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConfServiceService]
    });
  });

  it('should be created', inject([ConfServiceService], (service: ConfServiceService) => {
    expect(service).toBeTruthy();
  }));
});
