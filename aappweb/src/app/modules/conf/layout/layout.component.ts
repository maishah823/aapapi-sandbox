import { Component, OnInit } from '@angular/core';
import { ChatService } from '../chat/chat.service';


@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  constructor(private chatService:ChatService) { }

  ngOnInit(){
    this.chatService.join();
  }

  ngOnDestroy(){
    this.chatService.leave();
  }

}
