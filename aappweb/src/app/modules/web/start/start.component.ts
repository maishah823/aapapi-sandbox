import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {UserState} from '@shared/state';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit {

  user: UserState;
  numberOfSections = 1;

  constructor(private store: Store<any>) {
  }

  ngOnInit() {
    this.store.select('user').take(1).subscribe((user) => {
      this.user = user;
      if (user.isAdmin) {
        this.numberOfSections++;
      }
      if (user.isMember) {
        this.numberOfSections++;
      }
      if (user.isEducator) {
        this.numberOfSections++;
      }
      if (user.isAttendee) {
        this.numberOfSections++;
      }
      if (user.isEducator) {
        this.numberOfSections++;
      }

    });
  }

}
