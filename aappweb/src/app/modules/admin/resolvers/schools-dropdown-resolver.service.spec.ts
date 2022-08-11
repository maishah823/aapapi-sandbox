import { TestBed, inject } from '@angular/core/testing';

import { SchoolsDropdownResolverService } from './schools-dropdown-resolver.service';

describe('SchoolsDropdownResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SchoolsDropdownResolverService]
    });
  });

  it('should be created', inject([SchoolsDropdownResolverService], (service: SchoolsDropdownResolverService) => {
    expect(service).toBeTruthy();
  }));
});
