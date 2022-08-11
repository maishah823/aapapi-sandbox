import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../../environments/environment';

@Injectable()
export class PublicService {

  constructor(private http: HttpClient) {
  }

  schools() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/schools/schools-by-state', {headers});
  }

  schoolsDropdown() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/schools', {headers});
  }

  checkEmail(email: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/join/check-email', {email}, {headers});
  }

  authenticateForJoin(email: string, password: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/join/authenticate', {email, password}, {headers});
  }

  submitApplication(application: Object) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/join/submitApplication', {application}, {headers});
  }

  lookupInvoice(invoiceNumber: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/payment/lookupInvoice', {invoiceNumber}, {headers});
  }

  makePayment(paymentInfo: any) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/payment/make-payment', {paymentInfo}, {headers});
  }

  getAdvertData() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/conference/advert', {headers});
  }

  resetPassword(email: string, password: string, code: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/reset-pass', {email, password, code}, {headers});
  }

  sendResetEmail(email: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/send-reset-email', {email}, {headers});
  }

  getAnnouncements(page?: number, limit?: number) {
    let guarenteedPage = page || 1;
    let guarenteedLimit = limit || 10;
    let query = `?page=${guarenteedPage}&limit=${guarenteedLimit}`;
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/public-blogs/announcements' + query, {headers});
  }

  getSinglePost(id: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/public-blogs/single/' + id, {headers});
  }

  getSingleAuthPost(id: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/blogs/single/' + id, {headers});
  }

  getCertifications() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/public/certs', {headers});
  }
}
