import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'aapp-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss']
})
export class MemberComponent implements OnInit {

  @Input() user;
  @Output() onClick: EventEmitter<any> = new EventEmitter();

  constructor() {
  }

  ngOnInit() {
  }

  clicked() {
    this.onClick.emit();
  }

}
