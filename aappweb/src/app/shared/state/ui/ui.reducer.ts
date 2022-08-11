import * as UIActions from './ui.actions';
import { UIState } from './ui.model';

export function uiReducer(state = {}, action: UIActions.AllUiActions): UIState {
  switch(action.type) {
    case UIActions.CLEAR_UI: {
       return {}
    }

    default: {
      return state;
    }
  }
}