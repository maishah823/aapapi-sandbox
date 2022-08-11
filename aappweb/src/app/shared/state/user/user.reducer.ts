import * as UserActions from './user.actions';
import { UserState } from './user.model';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export function userReducer(state: UserState = { isLoggedIn: false }, action: UserActions.AllUserActions): UserState {
  switch (action.type) {
    case UserActions.LOGIN_SUCCESS: {
      return { ...action.payload, isLoggedIn: true };
    }
    case UserActions.LOGIN_FAIL: {
      console.error(action.payload);
      return { isLoggedIn: false }
    }
    case UserActions.LOGOUT: {
      return { isLoggedIn: false };
    }
    case UserActions.UPDATE_TOKEN:
      if (action.token !== state.token) {
        return Object.assign({}, { ...state, token: action.token });
      }
      return state;
    case UserActions.ADDRESS_UPDATED:
      return Object.assign({}, { ...state, hasAddress: true });
    case UserActions.INSTRUCTOR_INFO_UPDATED:
      return Object.assign({}, { ...state, hasInstructorInfo: true });
    case UserActions.CHECKOUT:
      return Object.assign({}, { ...state, checkedOut: true });
    default: {
      return state;
    }
  }
}

export const getUser = createFeatureSelector<UserState>('user');
export const getUserId = createSelector(getUser, (user: UserState) => user._id);