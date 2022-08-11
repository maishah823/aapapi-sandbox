import {UserState} from './user';
import {FormsState} from './forms';
import {UIState} from './ui';
import {ChatState} from '@conf/chat';
import {AlertsState} from './alerts';

export class ApplicationState{
    user:UserState;
    form:FormsState;
    ui:UIState;
    chat:ChatState;
    alerts:AlertsState;
}

export * from './user';
export * from './forms';
export * from './ui';
export * from './alerts';
