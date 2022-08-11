import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {TdMediaService} from '@covalent/core/media';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  isDeveloper: Observable<boolean>;

  constructor(public media: TdMediaService, private store: Store<any>) {
  }

  ngOnInit() {
    this.isDeveloper = this.store.select('user').map(user => user.isDeveloper);
  }

}
