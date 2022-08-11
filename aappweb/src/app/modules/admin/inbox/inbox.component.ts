import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {AdminService} from '@admin/services/admin.service';
import {Store} from '@ngrx/store';
import {User} from '@shared/classes';

@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss']
})
export class InboxComponent implements OnInit {

  stats: any;
  total = 0;
  pending: any;
  queryTitle = 'pending';
  user: User;

  constructor(private adminSvc: AdminService, private changeDet: ChangeDetectorRef, private store: Store<any>) {
  }

  ngOnInit() {

    this.store.select('user').take(1).subscribe(
      (res: User) => {
        this.user = res;
        this.getApplications(res.region);
      }
    );

  }

  getApplications(region) {

    this.adminSvc.regionalApplications(region).subscribe(
      (res: any) => {
        this.pending = res || [];
        this.changeDet.markForCheck();
      }
    );
  }

}

