import {Injectable} from '@angular/core';
import {Resolve, ActivatedRouteSnapshot} from '@angular/router';
import {Store} from '@ngrx/store';

@Injectable()
export class UserDataResolverService implements Resolve<any> {

  constructor(private store: Store<any>) {
  }

  resolve(route: ActivatedRouteSnapshot) {
    return this.store.select('user').take(1);
  }
}
