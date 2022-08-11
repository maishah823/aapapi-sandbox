import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../../../environments/environment';

@Injectable()
export class ReportsService {

  constructor(private http: HttpClient) {
  }

  getData(type: string) {
    const query = '?type=' + type;
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/reports/data' + query, {headers, responseType: 'blob'});
  }

  getLogs(page?: number, limit?: number) {
    const guarenteedPage = page || 1;
    const guarenteedLimit = limit || 10;
    const query = `?page=${guarenteedPage}&limit=${guarenteedLimit}`;
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/reports/download-logs' + query, {headers});
  }


}
