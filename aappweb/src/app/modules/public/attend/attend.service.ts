import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../../environments/environment';

@Injectable()
export class AttendService {

  constructor(private http: HttpClient) {
  }

  checkEmail(email: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/attend/check-email', {email}, {headers});
  }

  authenticateForAttend(email: string, password: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/attend/authenticate', {email, password}, {headers});
  }

  getEvents() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/attend/events', {headers});
  }

  getConference() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/attend/conference', {headers});
  }

  checkCoupon(code: string, type: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/attend/check-coupon', {code, type}, {headers});
  }

  process(type: string, record: any) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/attend/process', {type, record}, {headers});
  }

}
