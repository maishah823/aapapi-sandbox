import {Component, OnInit, ChangeDetectorRef, OnDestroy} from '@angular/core';
import {AdminService} from '@admin/services/admin.service';
import {UntypedFormGroup, UntypedFormBuilder, UntypedFormControl} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {UserState} from '@shared/state';
import {Subscription} from 'rxjs/Subscription';
import {TdMediaService} from '@covalent/core/media';

@Component({
  selector: 'app-invoices-by-cust',
  templateUrl: './invoices-by-cust.component.html',
  styleUrls: ['./invoices-by-cust.component.scss']
})
export class InvoicesByCustComponent implements OnInit, OnDestroy {

  users: any[] = [];
  currentUser: Observable<UserState>;
  page = 1;
  limit = 10;
  total = 0;
  pages = 1;

  searchForm: UntypedFormGroup;
  schoolForm: UntypedFormGroup;

  get searchTerm(): UntypedFormControl {
    return this.searchForm.get('search') as UntypedFormControl;
  }

  searchTermSub: Subscription;

  schools: any[] = [];

  constructor(private adminSvc: AdminService, public media: TdMediaService, private changeDet: ChangeDetectorRef, private fb: UntypedFormBuilder) {
  }

  ngOnInit() {

    this.searchForm = this.fb.group({
      search: '',
      type: '',
      showSuspended: false
    });
    this.searchTermSub = this.searchTerm.valueChanges.debounceTime(500).subscribe(
      (val: string) => {
        this.page = 1;
        this.getUserList();
      }
    );

    this.getUserList();
  }

  ngOnDestroy() {
    if (this.searchTermSub) {
      this.searchTermSub.unsubscribe();
    }
  }


  getUserList() {
    this.adminSvc.getUsersWithInvoices(this.page, this.limit, this.searchTerm.value).subscribe(
      (res: any) => {
        console.log(res);
        this.users = res.docs;
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
    this.getUserList();
  }

  hasGroup(u, g) {
    if (u.groups.indexOf(g) > -1) {
      return true;
    }
    return false;
  }

}
