import {Component, OnInit, ChangeDetectorRef, OnDestroy} from '@angular/core';
import {AdminService} from '@admin/services/admin.service';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {Subscription} from 'rxjs/Subscription';


@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit, OnDestroy {

  categories: string[] = [];
  logs: any[] = [];
  page = 1;
  limit = 20;
  total = 0;
  pages = 1;
  form: UntypedFormGroup;
  filterSub: Subscription;

  constructor(private adminSvc: AdminService, private changeDet: ChangeDetectorRef, private fb: UntypedFormBuilder) {
  }

  ngOnInit() {
    this.adminSvc.categories().subscribe(
      (res: any) => {
        this.categories = res;
        this.changeDet.markForCheck();
      }
    );
    this.form = this.fb.group({
      category: ''
    });
    this.getLogs();
    this.filterSub = this.form.controls.category.valueChanges.subscribe(
      () => {
        this.page = 1;
        this.getLogs();
      }
    );
  }

  ngOnDestroy() {
    if (this.filterSub) {
      this.filterSub.unsubscribe();
    }
  }

  getLogs() {
    this.adminSvc.logs(this.page, this.limit, this.form.controls.category.value).subscribe(
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
    this.getLogs();
  }

}
