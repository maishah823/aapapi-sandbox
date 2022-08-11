import {Injectable} from '@angular/core';
import {Resolve, ActivatedRouteSnapshot} from '@angular/router';
import {PublicService} from './public.service';

@Injectable()
export class SchoolsResolverService implements Resolve<any> {

  constructor(private publicSvc: PublicService) {
  }

  resolve(route: ActivatedRouteSnapshot) {
    return this.publicSvc.schoolsDropdown();
  }
}
