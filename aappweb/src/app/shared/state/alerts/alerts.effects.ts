import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Actions, Effect, ofType} from '@ngrx/effects';
import * as AlertActions from './alerts.actions';
import {UUID} from 'angular2-uuid';
import {Alert} from "@shared/classes";


@Injectable()
export class AlertEffects {
  @Effect() addAlert$: Observable<any> = this.actions$.pipe(ofType(AlertActions.ADD_ALERT))
    .mergeMap((action: AlertActions.AddAlert) => {
      let newState: Alert ={...action.alert}
      newState.index = UUID.UUID();
      return Observable.of(new AlertActions.Process(newState))
        .merge(Observable.of(new AlertActions.RemoveAlert(action.alert.index)).delay(6500));
    });

  constructor(
    private actions$: Actions
  ) {
  }

}
