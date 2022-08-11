import { Action } from '@ngrx/store';

export const CLEAR_UI = "[UI] CLEAR_UI";

export class ClearUI implements Action {
  readonly type = CLEAR_UI;
}


export type AllUiActions
  = ClearUI;