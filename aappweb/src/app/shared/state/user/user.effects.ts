import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Actions, Effect, ofType} from '@ngrx/effects';
import * as UserActions from './user.actions';
import {Router} from '@angular/router';
import {UserService} from '../../services/user.service';
import {UserState} from './user.model';
import {WindowAgentService} from 'app/main/window-agent.service';


@Injectable()
export class UserEffects {
  // Listen for the 'LOGIN' action
  @Effect() login$: Observable<any> = this.actions$.pipe(ofType(UserActions.LOGIN))
    .mergeMap((action: any) =>
      this.userSvc.login(action.payload)
        .map((data: UserState) => {
          if (this.devices.isStandAlone() && data.isAttendee) {
            this.router.navigate(['/web/conf/conf-start']);
          } else {
            this.router.navigate(['/web/start']);
          }
          return new UserActions.LoginSuccess(data);
        })
        .catch(
          (res) => {
            const errorMessage = (typeof res.error === 'string') ? res.error : 'Login attempt failed.';
            return Observable.of(new UserActions.LoginFail(errorMessage));
          }
        )
    );
  @Effect() loginout$: Observable<any> = this.actions$.pipe(ofType(UserActions.LOGOUT))
    .map((action: any) => {
      this.router.navigate(['/web/public']);
      return new UserActions.LogoutSuccess();
    });

  constructor(
    private userSvc: UserService,
    private actions$: Actions,
    private router: Router,
    private devices: WindowAgentService
  ) {
  }

}
