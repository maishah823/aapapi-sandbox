import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../environments/environment';

@Injectable()
export class WebService {

  constructor(private http: HttpClient) {
  }

  getAdvertData() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/conference/advert', {headers});
  }

  downloadPdfSchedule() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/conference/pdf/classroom', {headers, responseType: 'blob'});
  }

}
