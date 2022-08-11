import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input, OnChanges, OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {chatbubble} from '@shared/animations/chatbubble';
import {SocketService} from '@shared/services';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'chat-conv',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  animations: [chatbubble],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  constructor(private fb: UntypedFormBuilder, private socket: SocketService) {
  }

  @ViewChild('conv') convRef: ElementRef;
  @ViewChildren('messagesRef') messagesRef: QueryList<any>;
  @Input() messages = [];
  @Input() room = '';
  oldRoom: string;
  @Input() userId = '';
  @Output() sent: EventEmitter<string> = new EventEmitter<string>();
  @Output() more: EventEmitter<any> = new EventEmitter<any>();
  loadRoom: boolean;

  textInSound = new Audio();
  textOutSound = new Audio();

  socketSub: Subscription;
  messageChangeSub: Subscription;


  form: UntypedFormGroup;

  scrollLock;
  currentOffset = 0;

  ngOnInit() {

    this.textInSound.src = '/assets/sounds/text-in.mp3';
    this.textOutSound.src = '/assets/sounds/text-out.mp3';

    this.form = this.fb.group({
      message: <string>null
    });
    this.socketSub = this.socket.receivedMessageOnGroup.subscribe(
      (group: string) => {
        if (group == this.room) {
          this.textInSound.play();
        }
      }
    );


  }

  ngOnChanges() {
    if (this.room != this.oldRoom) {
      this.loadRoom = true;
      this.oldRoom = this.room;
    }
  }

  ngAfterViewInit() {
    this.messageChangeSub = this.messagesRef.changes.subscribe(() => {
      if (!this.scrollLock && !this.loadRoom && (this.convRef.nativeElement.scrollHeight - this.currentOffset > 150)) {
        this.convRef.nativeElement.scrollTop = this.convRef.nativeElement.scrollHeight - this.currentOffset;
      } else if (this.loadRoom) {

        setTimeout(() => {
          this.convRef.nativeElement.scrollTop = this.convRef.nativeElement.scrollHeight;
          this.loadRoom = false;
        }, 100);
      } else if (this.scrollLock) {
        this.convRef.nativeElement.scrollTop = this.convRef.nativeElement.scrollHeight;
      }


      this.currentOffset = this.convRef.nativeElement.scrollHeight;
    });
  }

  ngOnDestroy() {
    if (this.socketSub) {
      this.socketSub.unsubscribe();
    }
    if (this.messageChangeSub) {
      this.messageChangeSub.unsubscribe();
    }
  }


  sendMessage() {
    if (this.form.controls.message.value) {
      this.sent.emit(this.form.controls.message.value);
      this.scrollLock = true;
      this.form.reset();
      this.textOutSound.play();
    }
  }


  scrolled(e) {

    this.currentOffset = e.target.scrollHeight;
    if (e.target.scrollTop == 0) {

      this.scrollLock = false;
      this.more.emit();
      return;
    }
    if (e.target.scrollTop == e.target.scrollHeight - e.target.offsetHeight) {
      this.scrollLock = true;
      return;
    } else {
      this.scrollLock = false;
    }

  }

}
