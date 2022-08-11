import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ReportsService} from '../services/reports.service';
import {Store} from '@ngrx/store';
import * as moment from 'moment';
import {SaveFileService} from 'app/main/save-file.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  inProgress = false;

  page = 1;
  limit = 10;
  total = 0;

  logs = [];

  constructor(private files: SaveFileService, private reportsSvc: ReportsService,
              private store: Store<any>, private changeDet: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.getLogs();
  }

  getLogs() {
    this.reportsSvc.getLogs(this.page, this.limit).subscribe(
      (res: any) => {
        this.logs = res.docs || [];
        this.total = res.total;
        this.page = res.page;
        this.limit = res.limit;
        this.changeDet.markForCheck();

      }
    );
  }

  getData(type) {
    this.inProgress = true;
    var name = 'Download';
    switch (type) {
      case 'confreg':
        name = 'Seminar_Registrations_' + moment().format('YYYYMMDD') + '.xlsx';
        break;
      case 'members':
        name = 'AAPP_Members_' + moment().format('YYYYMMDD') + '.xlsx';
        break;
      case 'invoices':
        name = 'AAPP_Invoices_' + moment().format('YYYYMMDD') + '.xlsx';
        break;
      case 'schools':
        name = 'AAPP_Schools_' + moment().format('YYYYMMDD') + '.xlsx';
        break;
      case 'newstudents':
        name = 'AAPP_Unredeemed_Students_' + moment().format('YYYYMMDD') + '.xlsx';
        break;
      case 'guests':
        name = 'AAPP_Conf_Guests_' + moment().format('YYYYMMDD') + '.xlsx';
        break;
      case 'vendors':
        name = 'AAPP_Conf_Vendors_' + moment().format('YYYYMMDD') + '.xlsx';
        break;
      case 'applicants':
        name = 'AAPP_Conf_Applicants_' + moment().format('YYYYMMDD') + '.xlsx';
        break;
      case 'conditionalapplications':
        name = 'AAPP_Conditional_Applications_' + moment().format('YYYYMMDD') + '.xlsx';
        break;
    }
    this.reportsSvc.getData(type).finally(() => {
      this.inProgress = false;
    }).subscribe(
      (spreadsheet: any) => {
        this.files.saveOrView(spreadsheet, name);
      }
    );
  }

  pageEvent(e) {
    this.page = e.pageIndex + 1;
    this.limit = parseInt(e.pageSize);
    this.getLogs();
  }

}
