import { TestBed, inject } from '@angular/core/testing';

import { EditableService } from './editable.service';

describe('EditableService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EditableService]
    });
  });

  it('should be created', inject([EditableService], (service: EditableService) => {
    expect(service).toBeTruthy();
  }));
});
