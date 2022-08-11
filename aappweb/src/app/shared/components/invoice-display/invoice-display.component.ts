import {Component, OnInit, Input} from '@angular/core';
import {Invoice} from '@shared/classes';
import {InvoiceDisplayService} from '@shared/components/invoice-display/invoice-display.service';
import {Store} from '@ngrx/store';
import {AddAlert} from '@shared/state';
import {AlertTypes} from '@shared/classes';
import {SaveFileService} from 'app/main/save-file.service';

@Component({
  selector: 'aapp-invoice-display',
  templateUrl: './invoice-display.component.html',
  styleUrls: ['./invoice-display.component.scss']
})
export class InvoiceDisplayComponent implements OnInit {

  constructor(private files: SaveFileService, private invoiceSvc: InvoiceDisplayService, private store: Store<any>) {
  }

  @Input() invoice: Invoice;

  ngOnInit() {
  }

  printInvoice() {
    const tab = window.open();
    tab.document.open();
    tab.document.write('<html><body style="text-align:center">Loading Invoice...</body></html>');
    tab.document.close();
    this.invoiceSvc.getInvoicePDF(this.invoice._id).subscribe(
      (pdf: any) => {
        this.files.saveOrView(pdf, 'AAPP_Invoice_' + this.invoice.invoiceNumber + '.pdf', 'application/pdf');
      }
    );
  }

  resendInvoice() {
    this.invoiceSvc.resendInvoice(this.invoice._id).subscribe(
      (res: any) => {
        this.store.dispatch(new AddAlert({
          type: AlertTypes.SUCCESS,
          title: 'Success',
          message: 'The invoice has been sent to the email address on file.'
        }));
      }
    );
  }
}
