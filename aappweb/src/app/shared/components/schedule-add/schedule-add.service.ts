import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../../environments/environment';

@Injectable()
export class ScheduleAddService {

  constructor(private http: HttpClient) {
  }

  instructorsDropdown() {
    let headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/conf-admin/instructor-dropdown', {headers});
  }

  getTopics() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/conf-admin/topics', {headers});
  }

  saveEvent(event: any) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/conf-admin/schedule', {event}, {headers});
  }

}
