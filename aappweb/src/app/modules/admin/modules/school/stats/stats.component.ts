import {Component, OnInit, ChangeDetectorRef, OnDestroy} from '@angular/core';
import {SchoolService} from '@admin/modules/school/school.service';
import {UntypedFormGroup, UntypedFormBuilder} from '@angular/forms';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit, OnDestroy {

  constructor(private schoolSvc: SchoolService, private changeDet: ChangeDetectorRef, private fb: UntypedFormBuilder) {
  }

  stats: any = [];
  page = 1;
  limit = 10;
  total = 0;

  searchForm: UntypedFormGroup;
  searchSub: Subscription;

  ngOnInit() {
    this.searchForm = this.fb.group({
      search: ''
    });
    this.getStats();
    this.searchSub = this.searchForm.controls.search.valueChanges.debounceTime(600).subscribe(
      () => {
        this.page = 1;
        this.getStats();
      }
    );
  }

  ngOnDestroy() {
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
  }

  getStats() {
    this.schoolSvc.getSchoolStats(this.page, this.limit, this.searchForm.controls.search.value).subscribe(
      (res: any) => {
        this.stats = res.data || [];
        this.total = res.meta ? res.meta.total || 0 : 0;
        this.changeDet.markForCheck();
      }
    );
  }

  pageEvent(e) {
    this.page = e.pageIndex + 1;
    this.limit = parseInt(e.pageSize);
    this.getStats();
  }

  clearSearch() {
    this.page = 1;
    this.searchForm.reset();
  }

}
