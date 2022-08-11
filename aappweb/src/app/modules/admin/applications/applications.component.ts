import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {AdminService} from '@admin/services/admin.service';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent implements OnInit {

  stats: any;
  total = 0;
  page = 1;
  limit = 10;
  pending: any;
  queryTitle = 'pending';

  constructor(private adminSvc: AdminService, private changeDet: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.getApplications('pending');
  }

  getApplications(filter) {
    if (filter) {
      this.queryTitle = filter;
    }
    this.adminSvc.applications(filter, this.page, this.limit).subscribe(
      (res: any) => {
        this.stats = res.stats;
        this.pending = res.pending;
        this.total = res.total;
        this.changeDet.markForCheck();
      }
    );
  }

  changeType(filter) {
    this.page = 1;
    this.getApplications(filter);
  }

  pageEvent(e) {
    this.page = e.pageIndex + 1;
    this.limit = parseInt(e.pageSize);
    this.getApplications(this.queryTitle);
  }

}
