import { TestBed, inject } from '@angular/core/testing';

import { ConferencesDropdownResolverService } from './conferences-dropdown-resolver.service';

describe('ConferencesDropdownResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConferencesDropdownResolverService]
    });
  });

  it('should be created', inject([ConferencesDropdownResolverService], (service: ConferencesDropdownResolverService) => {
    expect(service).toBeTruthy();
  }));
});
