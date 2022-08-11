import {AlertsState} from './alerts.model';
import * as AlertsActions from './alerts.actions';
import {UUID} from 'angular2-uuid';

const initialState = {
  indexes: [],
  messages: {}
};

export function alertsReducer(state: AlertsState = initialState, action: AlertsActions.AllAlertsActions) {
  switch (action.type) {
    case AlertsActions.PROCESS_ADDITION:
      var newState = JSON.parse(JSON.stringify(state));

      const index = action.alert.index;
      newState.indexes.push(index);
      newState.messages[action.alert.index] = {...action.alert};
      return newState;
    case AlertsActions.REMOVE_ALERT:
      var removeState = Object.assign({}, state);
      delete removeState.messages[action.index];
      removeState.indexes = removeState.indexes.filter(index => index !== action.index);
      return removeState;
    case AlertsActions.CLEAR_ALERTS:
      return {indexes: [], messages: {}}

    default:
      return state;
  }
}
