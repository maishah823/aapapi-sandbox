import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'aapp-loading-button',
  templateUrl: './loading-button.component.html',
  styleUrls: ['./loading-button.component.scss']
})
export class LoadingButtonComponent {

  @Input() loading: boolean = false;
  @Input() icon: string;
  @Input() color;
  @Input() disabled: boolean = true;
  @Output() activated = new EventEmitter();

  activate() {
    this.activated.emit(true);
  }
}
