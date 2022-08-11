import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {AdminService} from '@admin/services/admin.service';

@Component({
  selector: 'app-rsvp',
  templateUrl: './rsvp.component.html',
  styleUrls: ['./rsvp.component.scss']
})
export class RsvpComponent implements OnInit {

  rsvps: any = [];

  constructor(private adminSvc: AdminService, private changeDet: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.getRsvps();
  }

  getRsvps() {
    this.adminSvc.getRsvps().subscribe(
      (res) => {
        this.rsvps = res;
        this.changeDet.markForCheck();
      }
    );
  }

}
