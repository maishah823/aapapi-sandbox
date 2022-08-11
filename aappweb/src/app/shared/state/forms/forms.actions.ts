import { Action } from '@ngrx/store';

export const UPDATE_FORM = "[Forms] UPDATE_FORM";
export const CLEAR_FORM = " [Forms] CLEAR_FORM";

export class UpdateForm implements Action {
  readonly type = UPDATE_FORM;
  constructor(public payload:{path:string,value:any}){}
}

export class ClearForm implements Action {
  readonly type = CLEAR_FORM;
  constructor(public payload:string){}
}

export type AllFormsActions
  = UpdateForm
  | ClearForm;