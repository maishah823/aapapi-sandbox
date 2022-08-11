import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../../environments/environment';

@Injectable()
export class DropdownService {

  constructor(private http: HttpClient) {
  }

  schools() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/dropdowns/schools', {headers});
  }

  topics() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/dropdowns/topics', {headers});
  }

  conferences() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/dropdowns/conferences', {headers});
  }

}
