import { Action } from '@ngrx/store';
import {UserState} from './user.model';

export const LOGIN  = '[User] LOGIN';
export const LOGIN_SUCCESS  = '[User] LOGIN_SUCCESS';
export const LOGIN_FAIL      = '[User] LOGIN_FAIL';
export const LOGOUT = '[User] LOGOUT';
export const LOGOUT_SUCCESS = '[User] LOGOUT_SUCCESS';
export const UPDATE_TOKEN = '[User] UPDATE_TOKEN';
export const ADDRESS_UPDATED = '[User] ADDRESS_UPDATED';
export const CHECKOUT = "[User] CHECKOUT";
export const INSTRUCTOR_INFO_UPDATED = '[User] INSTRUCTOR_INFO_UPDATED';

export class Login implements Action {
  readonly type = LOGIN;
  constructor(public payload:{email:string,password:string}){}
}

export class LoginSuccess implements Action {
  readonly type = LOGIN_SUCCESS;
  constructor(public payload:UserState){}
}

export class LoginFail implements Action {
  readonly type = LOGIN_FAIL;
  constructor(public payload:string){}
}

export class Logout implements Action {
  readonly type = LOGOUT;
}

export class LogoutSuccess implements Action {
  readonly type = LOGOUT_SUCCESS;
}

export class UpdateToken implements Action {
  readonly type = UPDATE_TOKEN;
  constructor(public token:string){}
}

export class AddressUpdated implements Action {
  readonly type = ADDRESS_UPDATED;
}

export class InstructorInfoUpdated implements Action {
  readonly type = INSTRUCTOR_INFO_UPDATED;
}

export class Checkout implements Action {
  readonly type = CHECKOUT;
}

export type AllUserActions
  = Login
  | LoginSuccess
  | LoginFail
  | Logout
  | LogoutSuccess
  | UpdateToken
  | AddressUpdated
  | InstructorInfoUpdated
  | Checkout;