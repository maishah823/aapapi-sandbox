import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {Invoice} from '@shared/classes';
import {UserService} from '../services/user.service';

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss']
})
export class PaymentHistoryComponent implements OnInit {

  invoices: Invoice[] = [];

  constructor(private userSvc: UserService, private changeDet: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.getInvoices();
  }

  getInvoices() {
    this.userSvc.getInvoices().subscribe(
      (invoices: Invoice[]) => {
        this.invoices = invoices;
        this.changeDet.markForCheck();
      }
    );
  }

}
