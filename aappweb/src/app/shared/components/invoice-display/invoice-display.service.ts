import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable()
export class InvoiceDisplayService {

  constructor(private http: HttpClient) { }
 

  getInvoicePDF(invoiceId:string){
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/financial/invoice-pdf/'+invoiceId, {headers, responseType:'blob'});
  }

  resendInvoice(invoiceId:string){
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/financial/resend-invoice/'+invoiceId, {headers});
  }


}