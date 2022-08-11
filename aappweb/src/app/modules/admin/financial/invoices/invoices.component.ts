import {Component, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
import {AdminService} from '@admin/services/admin.service';
import {Subscription} from 'rxjs/Subscription';
import {SocketService} from '@shared/services';
import {UntypedFormBuilder, UntypedFormGroup, UntypedFormControl} from '@angular/forms';
import {Store} from '@ngrx/store';
import {User} from '@shared/classes';
import {PaymentComponent} from '../dialogs/payment/payment.component';
import {AdjustComponent} from '@admin/financial/dialogs/adjust/adjust.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss']
})
export class InvoicesComponent implements OnInit, OnDestroy {

  allowActions = false;
  developerMode = false;

  invoices: any = [];
  invoicesSub: Subscription;

  searchTermSub: Subscription;
  filterSub: Subscription;

  searchForm: UntypedFormGroup;

  page = 1;
  limit = 10;
  total = 0;
  pages = 1;

  get searchTerm(): UntypedFormControl {
    return this.searchForm.get('search') as UntypedFormControl;
  }

  get filter(): UntypedFormControl {
    return this.searchForm.get('filter') as UntypedFormControl;
  }

  constructor(private dialog: MatDialog, private store: Store<any>,
              private fb: UntypedFormBuilder, private adminSvc: AdminService, private socket: SocketService,
              private changeDet: ChangeDetectorRef) {
  }

  ngOnInit() {

    this.store.select('user').take(1).subscribe(
      (user: User) => {
        if (user.groups.indexOf('financial') > -1) {
          this.allowActions = true;
        }
        if (user.isDeveloper) {
          this.developerMode = true;
        }
      }
    );

    this.searchForm = this.fb.group({
      search: '',
      filter: 'all'
    });

    this.searchTermSub = this.searchTerm.valueChanges.debounceTime(500).subscribe(
      (val: string) => {
        this.filter.setValue('all');
        this.getInvoices();
      }
    );
    this.filterSub = this.filter.valueChanges.subscribe(
      (val: string) => {
        this.getInvoices();
      }
    );
    this.invoicesSub = this.socket.invoicesChanged.subscribe(
      () => {
        this.getInvoices();
      }
    );
    this.getInvoices();
  }

  ngOnDestroy() {
    if (this.invoicesSub) {
      this.invoicesSub.unsubscribe();
    }
    if (this.filterSub) {
      this.filterSub.unsubscribe();
    }
  }

  getInvoices() {
    this.adminSvc.getInvoices(this.page, this.limit, this.searchTerm.value, this.filter.value).subscribe(
      (res: any) => {
        this.invoices = res.docs;
        this.page = res.page;
        this.limit = res.limit;
        this.total = res.total;
        this.pages = res.pages;
        this.changeDet.markForCheck();
      }
    );
  }

  resetSearch() {
    this.searchTerm.setValue('');
  }

  pageEvent(e) {
    this.page = e.pageIndex + 1;
    this.limit = parseInt(e.pageSize);
    this.getInvoices();
  }

  markAsPaid(invoice) {
    this.dialog.open(PaymentComponent, {}).afterClosed().subscribe(
      (result: any) => {
        // Add amount and invoice numbers.
        result.invoiceNumbers = [invoice.invoiceNumber];
        result.amount = invoice.amount;

        this.adminSvc.makeManualPayment(result).subscribe(
          (res: any) => {
            invoice.paid = true;
            this.changeDet.markForCheck();
          }
        );
      }
    );
  }

  adjustInvoice(invoice) {
    this.dialog.open(AdjustComponent, {data: {invoiceNumber: invoice.invoiceNumber, amount: invoice.amount}}).afterClosed().subscribe(
      (result: any) => {

        this.adminSvc.adjustInvoice(invoice._id, result.type, result.amount, result.lineNote).subscribe(
          (savedInvoice: any) => {
            invoice.amount = savedInvoice.amount;
            invoice.paid = savedInvoice.paid;

            this.changeDet.markForCheck();
          }
        );
      }
    );
  }

}
