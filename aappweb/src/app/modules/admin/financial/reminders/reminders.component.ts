import {Component, OnInit} from '@angular/core';
import {AdminService} from '@admin/services/admin.service';
import {Store} from '@ngrx/store';
import {AddAlert} from '@shared/state';
import {AlertTypes} from '@shared/classes';

@Component({
  selector: 'app-reminders',
  templateUrl: './reminders.component.html',
  styleUrls: ['./reminders.component.scss']
})
export class RemindersComponent implements OnInit {

  hideDuesButton = false;

  constructor(private adminSvc: AdminService, private store: Store<any>) {
  }

  ngOnInit() {
  }

  sendDuesReminders() {
    this.adminSvc.triggerDuesReminders().subscribe(() => {
      this.store.dispatch(new AddAlert({type: AlertTypes.SUCCESS, title: 'REMINDERS', message: 'The dues reminders have been triggered.'}));
    });
  }

  sendCheckoutReminders() {
    this.adminSvc.triggerCheckoutReminders().subscribe(() => {
      this.store.dispatch(new AddAlert({
        type: AlertTypes.SUCCESS,
        title: 'REMINDERS',
        message: 'The checkout reminders have been triggered.'
      }));
    });
  }

  generateYearlyDues() {
    this.adminSvc.generateYearlyDues().subscribe(() => {
      this.store.dispatch(new AddAlert({type: AlertTypes.SUCCESS, title: 'DUES', message: 'Yearly dues generated!'}));
    });
  }

}
