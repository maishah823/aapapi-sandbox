import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {Subject} from 'rxjs/Subject';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Store} from '@ngrx/store';
import {ChatMessage} from '../classes/ChatMessage';
import {AddChatMessageAction, GetStatsAction, ReplaceChatsAction, ReplaceMetaAction} from '../../modules/conf/chat/chat.actions';
import {WindowAgentService} from 'app/main/window-agent.service';
import {AppService} from 'app/main/app.service';
import {AddAlert} from '@shared/state';
import {AlertTypes} from '@shared/classes';
import {Observable} from 'rxjs/Observable';
import {io} from 'socket.io-client';


@Injectable()
export class SocketService {

  public attendProgress = new BehaviorSubject<{ type: string, email: string, message: string }>({
    type: 'Initialize',
    email: 'none',
    message: ''
  });

  public onlineUsers = new BehaviorSubject<string[]>([]);
  public socketConnected = new BehaviorSubject<boolean>(false);
  public receivedMessageOnGroup = new Subject<string>();
  public updateStats = new Subject<string>();
  public attendeesChanged = new Subject<string>();
  public invoicesChanged = new Subject<string>();
  public usersChanged = new Subject<string>();
  public memberUpdatesChanged = new Subject<boolean>();
  private userId;

  private _socket;

  // Keep track of joined authenticated channels for reconnect
  private channels = [];
  private token;

  constructor(private store: Store<any>, private devices: WindowAgentService, private appSvc: AppService) {
    this.create();
  }

  private create() {
    if (!this._socket) {
      const socket = io(environment.SOCKET_URI, {'transports': ['websocket']});
      socket.on('connect', () => {
        this.store.select('user').take(1).subscribe(
          user => {
            this.userId = user._id;
            this.channels.forEach(channel => {
              this._socket.emit('join', {channel: channel, token: user.socket});
            });

          }
        );
        this.socketConnected.next(true);

        if (!this.devices.isStandAlone()) {
          this.store.dispatch(new GetStatsAction());
        } else {
          Observable.timer(5000).subscribe(() => {
            this.store.dispatch(new GetStatsAction());

            const version = localStorage.getItem('pwa_version');
            this.appSvc.getVersion().subscribe(
              (current: any) => {
                if (current.version !== version) {
                  localStorage.setItem('pwa_version', current.version);
                  this.store.dispatch(new AddAlert({
                    type: AlertTypes.INFO,
                    title: 'Update',
                    message: 'An update has been found. Installing...'
                  }));
                  Observable.timer(2000).subscribe(() => {
                    window.location.reload();
                  });

                }
              }
            );


          });
        }


      });
      socket.on('disconnect', () => {
        this.socketConnected.next(false);
        console.log('DISCONNECTED');
      });
      socket.on('greet', (msg) => {
        console.log(msg);
      });
      socket.on('chat', (msg: string) => {
        try {
          const parsed = JSON.parse(msg);
          this.store.dispatch(new AddChatMessageAction(parsed.sentBy, parsed));
          this.receivedMessageOnGroup.next(parsed.sentBy);
        } catch (err) {
          console.error(err);
        }
        this.store.dispatch(new GetStatsAction());
      });
      socket.on('groupchat', (msg: string) => {
        try {
          const parsed = JSON.parse(msg);
          this.store.dispatch(new AddChatMessageAction(parsed.sentTo, parsed));
          this.receivedMessageOnGroup.next(parsed.sentTo);
        } catch (err) {
          console.error(err);
        }
        this.store.dispatch(new GetStatsAction());
      });
      socket.on('restore-chat', (msg: string) => {
        try {
          const message = JSON.parse(msg);
          const array = message.chats;
          const objs = array.map(JSON.parse);
          this.store.dispatch(new ReplaceChatsAction(message.user, objs));
        } catch (err) {
          console.error(err);
        }
      });
      socket.on('online', (msg: string) => {
        try {
          const message = JSON.parse(msg);
          this.onlineUsers.next(message);
          console.log('ONLINE USERS UPDATED');
        } catch (err) {
          console.error(err);
        }
      });
      socket.on('meta', (msg: string) => {
        try {
          const message = JSON.parse(msg);
          this.store.dispatch(new ReplaceMetaAction(message));
        } catch (err) {
          console.error(err);
        }
      });
      socket.on('attendProgress', (msg: string) => {
        try {
          const message = JSON.parse(msg);
          this.attendProgress.next(message);
        } catch (err) {
          console.error(err);
        }
      });

      // Changes
      socket.on('updateConfStats', (msg: string) => {
        this.updateStats.next();
      });
      socket.on('attendeesChanged', (msg: string) => {
        this.attendeesChanged.next();
      });
      socket.on('invoicesChanged', (msg: string) => {
        this.invoicesChanged.next();
      });
      socket.on('usersChanged', (msg: string) => {
        this.usersChanged.next();
      });
      socket.on('memberUpdatesChanged', (msg: string) => {
        this.memberUpdatesChanged.next(true);
      });

      this._socket = socket;
    }
  }

  public join(channel: string, token: string) {
    this.channels.push(channel);
    this._socket.emit('join', {channel: channel, token: token});
  }

  public leave(channel) {
    const index = this.channels.indexOf(channel);
    if (index > -1) {
      this.channels.splice(index, 1);
    }
    this._socket.emit('leave', channel);
  }

  public sendChatMessage(msg: ChatMessage) {
    this._socket.emit('chat', msg);
  }

  public getConversation(userId) {
    this._socket.emit('get-conversation', userId);
  }
}

