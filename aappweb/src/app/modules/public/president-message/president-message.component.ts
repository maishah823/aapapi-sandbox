import {Component, OnInit, HostBinding} from '@angular/core';

@Component({
  selector: 'app-president-message',
  templateUrl: './president-message.component.html',
  styleUrls: ['./president-message.component.scss'],
  host: {'display': 'block', 'width': '100%'}
})
export class PresidentMessageComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {

  }

}
