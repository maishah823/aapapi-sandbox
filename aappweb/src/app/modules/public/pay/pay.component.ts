import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {PublicService} from '@public/services/public.service';
import {emailValidator, stateValidator, zipCodeValidator} from 'validators';
import {fade} from '@shared/animations/fade';
import {ActivatedRoute, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {AddAlert} from '@shared/state';
import {Alert, AlertTypes} from '@shared/classes';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-pay',
  templateUrl: './pay.component.html',
  styleUrls: ['./pay.component.scss'],
  animations: [fade]
})
export class PayComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('searchBox') searchBox: ElementRef;

  searchForm: UntypedFormGroup;
  searchSub: Subscription;

  creditcardsub: Subscription;
  expYearSub: Subscription;
  expMonthSub: Subscription;
  cvvSub: Subscription;

  candidate: any;
  invoices: any = [];
  savedInvoiceNumbers = [];
  paymentForm: UntypedFormGroup;

  searchPlaceholder = 'Search Invoice #';

  inProgress = false;

  showSearchArrow: boolean;
  showAddArrow: boolean;
  searchArrowCount = 0;

  get search(): UntypedFormControl {
    return this.searchForm.get('search') as UntypedFormControl;
  }

  get address(): UntypedFormGroup {
    return this.paymentForm.get('address') as UntypedFormGroup;
  }

  get cc(): UntypedFormGroup {
    return this.paymentForm.get('cc') as UntypedFormGroup;
  }

  get expYear(): UntypedFormGroup {
    return this.paymentForm.get('expYear') as UntypedFormGroup;
  }

  get expMonth(): UntypedFormGroup {
    return this.paymentForm.get('expMonth') as UntypedFormGroup;
  }

  get cvv(): UntypedFormGroup {
    return this.paymentForm.get('cvv') as UntypedFormGroup;
  }

  constructor(private router: Router, private store: Store<any>,
              private activatedRoute: ActivatedRoute, private fb: UntypedFormBuilder,
              private publicSvc: PublicService, private changeDet: ChangeDetectorRef) {
  }

  ngOnInit() {

    this.searchForm = this.fb.group({
      search: <string>null
    });
    this.search.valueChanges.debounceTime(300).subscribe(
      (val: string) => {
        if (!val) {
          return;
        }
        this.search.setValue(val.replace(/[^0-9\-]+/, ''));
        if (val) {
          this.searchInvoices();
        }
      }
    );
    this.paymentForm = this.fb.group({
      agency: '',
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      address: this.fb.group({
        international: false,
        street1: ['', Validators.required],
        street2: [''],
        city: ['', Validators.required],
        state: ['', Validators.compose([stateValidator, Validators.required])],
        zip: ['', Validators.compose([zipCodeValidator, Validators.required])],
        country: ['United States', Validators.required],
      }),
      email: ['', [emailValidator, Validators.required]],
      cc: [null, [Validators.pattern(/[0-9]{15,16}/), Validators.required]],
      expMonth: [null, [Validators.pattern(/[0-9]{1,2}/), Validators.min(1), Validators.max(12), Validators.required]],
      expYear: [null, [Validators.pattern(/[0-9]{4,4}/), Validators.min(2018), Validators.max(2099), Validators.required]],
      cvv: [null, [Validators.pattern(/[0-9]{3,4}/), Validators.min(0), Validators.max(9999), Validators.required]]
    });

    this.creditcardsub = this.cc.valueChanges.subscribe(
      val => {
        if (val.match(/[\D]+/g) || val.length > 16) {
          this.cc.setValue(val.replace(/[\D]+/g, '').substring(0, 16));
          this.paymentForm.updateValueAndValidity();
        }
      }
    );
    this.expMonthSub = this.expMonth.valueChanges.subscribe(
      val => {
        if (val.match(/[\D]+/g) || val.length > 2) {
          this.expMonth.setValue(val.replace(/[\D]+/g, '').substring(0, 2));
          this.paymentForm.updateValueAndValidity();
        }
      }
    );
    this.expYearSub = this.expYear.valueChanges.subscribe(
      val => {
        if (val.match(/[\D]+/g) || val.length > 4) {
          this.expYear.setValue(val.replace(/[\D]+/g, '').substring(0, 4));
          this.paymentForm.updateValueAndValidity();
        }
      }
    );
    this.cvvSub = this.cvv.valueChanges.subscribe(
      val => {
        if (val.match(/[\D]+/g) || val.length > 4) {
          this.cvv.setValue(val.replace(/[\D]+/g, '').substring(0, 4));
          this.paymentForm.updateValueAndValidity();
        }
      }
    );


  }

  ngAfterViewInit() {
    if (!this.activatedRoute.snapshot.params['invoice']) {
      setTimeout(() => this.searchBox.nativeElement.focus(), 0);
      this.pointToSearch();
    } else {
      this.searchForm.get('search').setValue(this.activatedRoute.snapshot.params['invoice']);
    }

  }

  ngOnDestroy() {
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
    if (this.expMonthSub) {
      this.expMonthSub.unsubscribe();
    }
    if (this.expYearSub) {
      this.expYearSub.unsubscribe();
    }
    if (this.creditcardsub) {
      this.creditcardsub.unsubscribe();
    }
    if (this.cvvSub) {
      this.cvvSub.unsubscribe();
    }
  }

  searchInvoices() {
    this.publicSvc.lookupInvoice(this.search.value).subscribe(
      (res: any) => {
        if (!res || this.savedInvoiceNumbers.indexOf(res.invoiceNumber) > -1) {
          this.candidate = null;
          return;
        }
        this.candidate = res;
        this.pointToAdd();
        this.changeDet.markForCheck();
      }
    );
  }

  addInvoice(invoice) {
    this.invoices.push(invoice);
    this.savedInvoiceNumbers.push(invoice.invoiceNumber);
    this.candidate = null;
    this.searchForm.reset();
    this.searchPlaceholder = 'Add additional invoice #';
    this.pointToSearch();
  }

  removeInvoice(invoice, index) {
    this.invoices.splice(index, 1);
    this.savedInvoiceNumbers.splice(this.savedInvoiceNumbers.indexOf(invoice.invoiceNumber), 1);

  }

  totalAmount() {
    var total = 0;
    this.invoices.forEach((invoice) => {
      total = total + invoice.amount;
    });
    return total;
  }

  submitPayment() {
    if (!this.paymentForm.valid || !this.savedInvoiceNumbers || this.savedInvoiceNumbers.length < 1) {
      return;
    }
    this.inProgress = true;
    let paymentInfo = {
      firstName: this.paymentForm.get('firstName').value,
      lastName: this.paymentForm.get('lastName').value,
      address: {
        street1: this.address.get('street1').value,
        street2: this.address.get('street2').value,
        city: this.address.get('city').value,
        state: this.address.get('state').value,
        zip: this.address.get('zip').value,
        country: this.address.get('country').value,
      },
      email: this.paymentForm.get('email').value,
      cc: this.paymentForm.get('cc').value,
      expMonth: this.paymentForm.get('expMonth').value,
      expYear: this.paymentForm.get('expYear').value,
      cvv: this.paymentForm.get('cvv').value,
      invoices: this.savedInvoiceNumbers,
      amount: this.totalAmount()
    };

    this.publicSvc.makePayment(paymentInfo).finally(() => {
      this.inProgress = false;
    }).subscribe(
      (res: any) => {
        this.store.dispatch(new AddAlert({type: AlertTypes.SUCCESS, title: 'Payments', message: 'Payment Received. Thank you.'} as Alert));
        this.router.navigate(['/web']);
        this.changeDet.markForCheck();
      }
    );

  }

  pointToSearch() {
    this.searchArrowCount = this.searchArrowCount + 1;
    if (!this.showSearchArrow && this.searchArrowCount < 3) {
      this.showSearchArrow = true;
      setTimeout(() => {
        this.showSearchArrow = false;
        this.changeDet.markForCheck();
      }, 2000);
    }
  }

  pointToAdd() {
    if (!this.showAddArrow && this.searchArrowCount < 2) {
      this.showAddArrow = true;
      setTimeout(() => {
        this.showAddArrow = false;
        this.changeDet.markForCheck();
      }, 2000);
    }
  }

}
