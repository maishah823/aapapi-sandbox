import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {AlertsState, ApplicationState} from '@shared/state';
import {slideInFromRight, slideInFromRightChild} from '@shared/animations';
import {of} from 'rxjs/observable/of';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  animations: [slideInFromRight, slideInFromRightChild]
})
export class AlertComponent implements OnInit {

  alerts: Observable<AlertsState> = of({indexes: [], messages: {}});

  constructor(private store: Store<ApplicationState>) {
  }

  ngOnInit() {
    this.alerts = this.store.select(state => state.alerts);
  }

}
