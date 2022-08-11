import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {SocketService} from '@shared/services/socket.service';
import {Observable} from 'rxjs/Observable';
import {Store} from '@ngrx/store';
import {ApplicationState} from '@shared/state';
import {
  ClearAllChatAction,
  GetConversationAction,
  getConversationsSortedArrays,
  getFilteredMeta,
  GetMoreConversationAction,
  getStats,
  MarkRoomAsViewedAction
} from '@conf/chat';
import {ChatService} from '@conf/chat/chat.service';
import {getUserId} from '@shared/state/user/user.reducer';
import {Subscription} from 'rxjs/Subscription';
import {TdMediaService} from '@covalent/core/media';


@Component({
  selector: 'app-social',
  templateUrl: './social.component.html',
  styleUrls: ['./social.component.scss']
})
export class SocialComponent implements OnInit, OnDestroy {
  selectedRoom;
  onlineUsers$: Observable<any>;
  meta$: Observable<any>;
  stats$: Observable<any>;
  conversations$: Observable<any>;
  userId$: Observable<string>;
  socketConnectedSub: Subscription;
  receivedMessageSub: Subscription;
  isConnected: boolean = false;
  previouslySelected = {};
  title: string = 'Select Group or Individual';


  constructor(public media: TdMediaService, private socket: SocketService,
              private store: Store<ApplicationState>, private chatSvc: ChatService,
              private changeDet: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.onlineUsers$ = this.socket.onlineUsers;
    this.meta$ = this.store.select(getFilteredMeta);
    this.stats$ = this.store.select(getStats);
    this.conversations$ = this.store.select(getConversationsSortedArrays);
    this.userId$ = this.store.select(getUserId);
    this.socketConnectedSub = this.socket.socketConnected.subscribe(
      (isConnected: boolean) => {
        this.isConnected = isConnected;
        if (isConnected) {
          //On reconnect...
          this.previouslySelected = {};
          if (this.selectedRoom) {
            this.previouslySelected[this.selectedRoom] = true;
            this.store.dispatch(new GetConversationAction(this.selectedRoom));
          } else {
            this.store.dispatch(new ClearAllChatAction());
          }
        }
        this.changeDet.markForCheck();
      }
    );
    this.receivedMessageSub = this.socket.receivedMessageOnGroup.subscribe(
      (group: string) => {
        if (group == this.selectedRoom) {
          this.store.dispatch(new MarkRoomAsViewedAction(group));
        }
      }
    );
  }

  ngOnDestroy() {
    if (this.socketConnectedSub) {
      this.socketConnectedSub.unsubscribe();
    }
    if (this.receivedMessageSub) {
      this.receivedMessageSub.unsubscribe();
    }
  }

  selectGroup(group) {
    if (group.id == this.selectedRoom) {
      return;
    }
    this.selectedRoom = group.id;
    this.title = group.name;
    this.store.dispatch(new MarkRoomAsViewedAction(group.id));
    if (this.previouslySelected[group.id]) {
      return;
    }
    this.store.dispatch(new GetMoreConversationAction(group.id));
    this.previouslySelected[group.id] = true;

  }

  sent(e: string) {
    this.chatSvc.sendMessage(this.selectedRoom, e);
  }

  getMore() {
    this.store.dispatch(new GetMoreConversationAction(this.selectedRoom));
  }

}
