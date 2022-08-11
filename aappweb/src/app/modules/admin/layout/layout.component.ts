import {Component, OnInit, OnDestroy} from '@angular/core';
import {SocketService} from '@shared/services';
import {Store} from '@ngrx/store';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnDestroy {

  constructor(private socket: SocketService, private store: Store<any>) {
  }

  ngOnInit() {
    this.store.select('user').take(1).subscribe(
      user => {
        this.socket.join('admin', user.socket);
      }
    );
  }

  ngOnDestroy() {
    this.socket.leave('admin');
  }

}
