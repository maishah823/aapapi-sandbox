import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { UserState } from '@shared/state/user/user.model';
import { Router } from '@angular/router';
import { AddAlert } from '@shared/state/alerts';
import { AlertTypes } from '@shared/classes/Alert';

@Injectable()
export class RequiredInfoGuard implements CanActivate {
    constructor(private store: Store<any>, private router: Router) { }
    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.store.select('user').take(1).map(
            (user: UserState) => {
                if (user.passwordIsTemp) {
                    console.log('PASSWORD HAS NOT BEEN CHANGED.');
                    this.store.dispatch(new AddAlert({ type: AlertTypes.INFO, title: 'Update Profile', message: 'You must change your TEMPORARY PASSWORD before continuing.' }));
                    this.router.navigate(['/web/user/profile']);
                    return false;
                }
                if (!user.hasAddress) {
                    console.log("NO ADDRESS");
                    this.store.dispatch(new AddAlert({ type: AlertTypes.INFO, title: 'Update Profile', message: 'You must COMPLETE your ADDRESS before continuing.' }));
                    this.router.navigate(['/web/user/profile']);
                    return false;
                } else if (user.isInstructor && !user.hasInstructorInfo) {
                    console.log("INCOMPLETE INSTRUCTOR INFO");
                    this.router.navigate(['/web/user/profile']);
                    this.store.dispatch(new AddAlert({ type: AlertTypes.INFO, title: 'Update Profile', message: 'You must UPDATE your INSTRUCTOR INFO before continuing.' }));
                    return false;
                }
                return true;
            }
        );
    }
    canLoad(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.store.select('user').take(1).map(
            (user: UserState) => {
                if (user.passwordIsTemp) {
                    console.log('PASSWORD HAS NOT BEEN CHANGED.');
                    this.store.dispatch(new AddAlert({ type: AlertTypes.INFO, title: 'Update Profile', message: 'You must change your TEMPORARY PASSWORD before continuing.' }));
                    this.router.navigate(['/web/user/profile']);
                    return false;
                }
                if (!user.hasAddress) {
                    console.log("NO ADDRESS");
                    this.store.dispatch(new AddAlert({ type: AlertTypes.INFO, title: 'Update Profile', message: 'You must COMPLETE your ADDRESS before continuing.' }));
                    this.router.navigate(['/web/user/profile']);
                    return false;
                } else if (user.isInstructor && !user.hasInstructorInfo) {
                    console.log("INCOMPLETE INSTRUCTOR INFO");
                    this.store.dispatch(new AddAlert({ type: AlertTypes.INFO, title: 'Update Profile', message: 'You must UPDATE your INSTRUCTOR INFO before continuing. At a minimun, add a picture, title, and summary to your instructor profile.' }));
                    this.router.navigate(['/web/user/profile']);
                    return false;
                }
                return true;
            }
        );
    }
}
