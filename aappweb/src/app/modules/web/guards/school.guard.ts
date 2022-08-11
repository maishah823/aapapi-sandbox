import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { UserState } from '@shared/state/user/user.model';
import { Router } from '@angular/router';

@Injectable()
export class SchoolGuard implements CanActivate {
  constructor(private store: Store<any>, private router: Router) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.store.select('user').take(1).map(
      (user: UserState) => {
        if (user.isEducator) {
          return true;
        }
        this.router.navigate(['/web']);
        return false;
      }
    );
  }
  canLoad(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.store.select('user').take(1).map(
      (user: UserState) => {
        if (user.isEducator) {
          return true;
        }
        this.router.navigate(['/web']);
        return false;
      }
    );
  }
}
