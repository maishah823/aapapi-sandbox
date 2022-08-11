import {Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'app-event-line',
  templateUrl: './event-line.component.html',
  styleUrls: ['./event-line.component.scss']
})
export class EventLineComponent implements OnInit {

  @Input() label: string;
  @Input() value: any;

  constructor() {
  }

  ngOnInit() {
  }

  valueType() {
    if (typeof this.value === 'string') {
      return 'string';
    }
    if (this.value && Array.isArray(this.value) && this.value.length > 0) {
      return 'array';
    }
    return 'unkonwn';
  }

}

