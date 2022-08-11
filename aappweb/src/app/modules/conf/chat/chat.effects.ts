import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Actions, Effect, ofType} from '@ngrx/effects';
import * as ChatActions from './chat.actions';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {Store} from '@ngrx/store';
import {ApplicationState} from '@shared/state';
import {numberOfMessagesInConvo} from '@conf/chat/chat.selectors';


@Injectable()
export class ChatEffects {
  @Effect() getConversation$: Observable<any> = this.actions$.pipe(ofType(ChatActions.GET_CONVERSATION))
    .switchMap((action: ChatActions.GetConversationAction) => {
      return this.http.get(environment.API_URI + '/chat/conv/' + action.room)
        .switchMap((res: any) => {
          return [new ChatActions.ReplaceChatsAction(action.room, res), new ChatActions.MarkRoomAsViewedAction(action.room)];
        });
    });
  @Effect() getMoreConversation$: Observable<any> = this.actions$.pipe(ofType(ChatActions.GET_MORE_CONVERSATION))
    .switchMap((action: ChatActions.GetMoreConversationAction) => {
      return this.store.select(numberOfMessagesInConvo(action.room)).take(1)
        .switchMap((length: number = 0) => {
          return this.http.get(environment.API_URI + '/chat/conv/' + action.room + '?cursor=' + length)
            .switchMap((res: any) => {
              return [new ChatActions.UpdateChatsAction(action.room, res)];
            });
        });
    });
  @Effect() getChatStats$: Observable<any> = this.actions$.pipe(ofType(ChatActions.GET_STATS))
    .switchMap((action: ChatActions.GetStatsAction) => {
      return this.http.get(environment.API_URI + '/chat/stats')
        .map((res: any) => {
          return new ChatActions.ChatStatsReplaceAction(res || {});
        });
    });
  @Effect() markRoomAsViewed$: Observable<any> = this.actions$.pipe(ofType(ChatActions.MARK_ROOM_AS_VIEWED))
    .switchMap((action: ChatActions.MarkRoomAsViewedAction) => {
      return this.http.post(environment.API_URI + '/chat/markRoomAsViewed', {room: action.room})
        .map((res: any) => {
          return new ChatActions.MarkRoomAsViewedSuccessAction(res.room);
        });
    });

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private store: Store<ApplicationState>
  ) {
  }

}
