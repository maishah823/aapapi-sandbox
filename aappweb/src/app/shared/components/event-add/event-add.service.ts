import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable()
export class EventAddService {

  constructor(private http:HttpClient) { }

  saveEvent(event:any){
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/conf-admin/event',{event}, {headers});
  }

}
