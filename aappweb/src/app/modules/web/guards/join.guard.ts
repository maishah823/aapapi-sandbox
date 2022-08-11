import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { UserState } from '@shared/state/user/user.model';


@Injectable()
export class JoinGuard implements CanActivate {
  constructor(private store: Store<any>, private router:Router) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.store.select('user').take(1).map(
      (user: UserState) => {
        if (user.isMember) {
            this.router.navigate(['/web/members']);
          return false;
        }
        return true;
      }
    );
  }
}