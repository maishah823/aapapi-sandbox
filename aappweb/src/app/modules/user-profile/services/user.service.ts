import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {Address} from '@shared/classes/Address';

@Injectable()
export class UserService {

  constructor(private http: HttpClient) {
  }

  getOwnUserData() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/users/self', {headers});

  }

  updateEmail(email: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/users/updateOwnEmail', {email}, {headers});

  }

  updateAddress(address: Address) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/users/updateOwnAddress', {address}, {headers});

  }

  getInvoices() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/users/getOwnInvoices', {headers});
  }

  resetPassword(password: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/users/resetOwnPassword', {password}, {headers});

  }

  getEvents() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/attend/events', {headers});
  }

  getConferenceInfo() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/users/my-conf-info', {headers});
  }

  addGuest(guestInfo) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/users/addGuest', {guestInfo}, {headers});

  }

  downloadUpgradeForm() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/users/download-upgrade-form', {headers, responseType: 'blob'});
  }

}
