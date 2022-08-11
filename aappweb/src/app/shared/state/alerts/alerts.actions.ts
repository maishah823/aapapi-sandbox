import { Action } from '@ngrx/store';
import { Alert} from '../../classes';

export const ADD_ALERT = "[Alerts] ADD";
export const PROCESS_ADDITION = "[Alerts] PROCESS";
export const REMOVE_ALERT = "[Alerts] REMOVE";
export const CLEAR_ALERTS = "[Alerts] CLEAR";

export class AddAlert implements Action {
  readonly type = ADD_ALERT;
  constructor(public alert:Alert){}
}

export class Process implements Action{
  readonly type = PROCESS_ADDITION;
  constructor(public alert:Alert){}
}

export class RemoveAlert implements Action {
  readonly type = REMOVE_ALERT;
  constructor(public index:string){}
}

export class ClearAlerts implements Action {
    readonly type = CLEAR_ALERTS;
  }

export type AllAlertsActions
  = AddAlert
  | Process
  | RemoveAlert
  | ClearAlerts;
