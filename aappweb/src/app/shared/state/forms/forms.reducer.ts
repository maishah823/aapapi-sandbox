import { FormsState } from './forms.model';
import * as FormsActions from './forms.actions';

const initialState = {
    join:{},
    indv:{},
    agency:{},
    vendor:{},
    blog: {}
};

export function formsReducer(state: FormsState = initialState, action: FormsActions.AllFormsActions) {
    switch (action.type) {
        case FormsActions.UPDATE_FORM:
            return Object.assign({},state, {[action.payload.path]:action.payload.value});
        case FormsActions.CLEAR_FORM:
            return Object.assign({},state, {[action.payload]:{}});
        
        default:
            return state;
    }
}