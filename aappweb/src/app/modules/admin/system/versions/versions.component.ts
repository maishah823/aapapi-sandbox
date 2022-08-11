import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {version} from 'environments/version';
import {AdminService} from '@admin/services/admin.service';

@Component({
  selector: 'app-versions',
  templateUrl: './versions.component.html',
  styleUrls: ['./versions.component.scss']
})
export class VersionsComponent implements OnInit {

  version = version;
  history: any[] = [];
  page = 1;
  limit = 10;
  total = 0;
  pages = 0;


  constructor(private adminSvc: AdminService, private changeDet: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.getVersionHistory();
  }

  getVersionHistory() {
    this.adminSvc.getVersionHistory(this.page, this.limit).subscribe(
      (res: any) => {
        this.history = res.docs;
        this.page = res.page;
        this.limit = res.limit;
        this.pages = res.pages;
        this.total = res.total;
        this.changeDet.markForCheck();
      }
    );
  }

  pageEvent(e) {
    this.page = e.pageIndex + 1;
    this.limit = parseInt(e.pageSize);
    this.getVersionHistory();
  }

}
