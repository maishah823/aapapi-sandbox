import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {AdminService} from '@admin/services/admin.service';

@Component({
  selector: 'app-guest-list',
  templateUrl: './guest-list.component.html',
  styleUrls: ['./guest-list.component.scss']
})
export class GuestListComponent implements OnInit {

  guestlists: any = [];

  constructor(private adminSvc: AdminService, private changeDet: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.getGuestLists();
  }

  getGuestLists() {
    this.adminSvc.getGuestLists().subscribe(
      (res: any) => {
        this.guestlists = res;
        this.changeDet.markForCheck();
      }
    );
  }

}
