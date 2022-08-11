import {Injectable} from '@angular/core';
import {Resolve, ActivatedRouteSnapshot} from '@angular/router';
import {DropdownService} from '../services/dropdown.service';

@Injectable()
export class SchoolsDropdownResolverService implements Resolve<any> {

  constructor(private dropdownSvc: DropdownService) {
  }

  resolve(route: ActivatedRouteSnapshot) {
    return this.dropdownSvc.schools();
  }
}
