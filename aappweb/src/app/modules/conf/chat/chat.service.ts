import {Injectable} from '@angular/core';
import {SocketService} from '@shared/services';
import {Store} from '@ngrx/store';
import {ChatMessage} from '@shared/classes/ChatMessage';
import {UUID} from 'angular2-uuid';
import {AddChatMessageAction, MarkRoomAsViewedAction} from './chat.actions';

@Injectable()
export class ChatService {

  userId: string;
  userName: string;

  constructor(private socketSvc: SocketService, private store: Store<any>) {
  }

  join() {
    this.store.select('user').take(1).subscribe(
      user => {
        this.socketSvc.join('conf', user.socket);
        this.userId = user._id;
        this.userName = user.fullname;
      }
    );
  }

  leave() {
    this.socketSvc.leave('conf');
  }


  sendMessage(sentTo: string, message: string) {
    let msg: ChatMessage = {
      messageId: UUID.UUID(),
      date: new Date(),
      sentTo: sentTo,
      sentBy: this.userId,
      senderName: this.userName,
      message: message
    };
    this.socketSvc.sendChatMessage(msg);
    this.store.dispatch(new AddChatMessageAction(msg.sentTo, msg));
    this.store.dispatch(new MarkRoomAsViewedAction(sentTo));
  }

}
