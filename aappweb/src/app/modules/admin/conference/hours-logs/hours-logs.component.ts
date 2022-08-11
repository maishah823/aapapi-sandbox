import {Component, OnInit, ChangeDetectorRef, OnDestroy} from '@angular/core';
import {AdminService} from '@admin/services/admin.service';
import {UntypedFormGroup, UntypedFormBuilder, UntypedFormControl} from '@angular/forms';
import {SaveFileService} from 'app/main/save-file.service';
import {Store} from '@ngrx/store';
import {AddAlert} from '@shared/state';
import {AlertTypes, Alert} from '@shared/classes';
import {Router, ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-hours-logs',
  templateUrl: './hours-logs.component.html',
  styleUrls: ['./hours-logs.component.scss']
})
export class HoursLogsComponent implements OnInit , OnDestroy{

  logs = [];
  inProgress = false;
  searchTermSub: Subscription;

  searchForm: UntypedFormGroup;

  conferences = [{_id: null, name: 'Current Seminar'}];

  page = 1;
  limit = 10;
  total = 0;
  pages = 1;

  get searchTerm(): UntypedFormControl {
    return this.searchForm.get('search') as UntypedFormControl;
  }

  get conf(): UntypedFormControl {
    return this.searchForm.get('conf') as UntypedFormControl;
  }

  constructor(private fb: UntypedFormBuilder, private adminSvc: AdminService, private changeDet: ChangeDetectorRef, private files: SaveFileService, private store: Store<any>, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.conferences = this.route.snapshot.data.conferences;
    this.searchForm = this.fb.group({
      search: '',
      conf: this.conferences[0]._id || null,
    });

    console.log(this.conferences);
    this.searchTermSub = this.searchTerm.valueChanges.debounceTime(500).subscribe(
      (val: string) => {
        this.page = 1;
        this.getHoursLogs();
      }
    );
    this.getHoursLogs();
  }

  ngOnDestroy() {
    if (this.searchTermSub) {
      this.searchTermSub.unsubscribe();
    }
  }

  conferenceChanged() {
    this.page = 1;
    this.getHoursLogs();
  }

  getHoursLogs() {
    this.adminSvc.getHoursLogs(this.page, this.limit, this.conf.value, this.searchTerm.value).subscribe(
      (res: any) => {
        this.logs = res.docs;
        this.page = res.page;
        this.limit = res.limit;
        this.total = res.total;
        this.pages = res.pages;
        this.changeDet.markForCheck();
      }
    );
  }

  pageEvent(e) {
    this.page = e.pageIndex + 1;
    this.limit = parseInt(e.pageSize);
    this.getHoursLogs();
  }

  download(log) {
    this.inProgress = true;
    this.changeDet.markForCheck();
    this.adminSvc.downloadBluesheet(log._id).finally(() => {
      this.inProgress = false;
    }).subscribe(
      (res: Blob) => {
        if (res.size > 0) {
          this.files.saveOrView(res, `AAPP_Certificate_${log.firstName}_${log.lastName}_${(new Date()).getFullYear()}`, 'application/pdf');
          this.inProgress = false;
        }
      }
    );
  }

  email(log) {
    this.inProgress = true;
    this.changeDet.markForCheck();
    this.adminSvc.emailBluesheet(log._id).finally(() => {
      this.inProgress = false;
    }).subscribe(
      (res) => {
        this.store.dispatch(new AddAlert({
          type: AlertTypes.SUCCESS,
          title: 'Bluesheet',
          message: 'Bluesheet emailed to attendee.'
        } as Alert));
      }
    );
  }

}
