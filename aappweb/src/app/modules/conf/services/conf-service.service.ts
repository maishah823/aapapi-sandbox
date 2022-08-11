import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../../environments/environment';

@Injectable()
export class ConfServiceService {

  constructor(private http: HttpClient) {
  }

  getCombinedEvents() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/conference/combined-events', {headers});
  }

  getClassroomEvents() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/conference/classroom-events', {headers});
  }

  getEvents() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/conference/events', {headers});
  }

  getClassroomDetail(id) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/conference/classroom-detail/' + id, {headers});
  }

  getConferenceNews(page?: number, limit?: number) {
    let guarenteedPage = page || 1;
    let guarenteedLimit = limit || 10;
    let query = `?page=${guarenteedPage}&limit=${guarenteedLimit}`;
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/blogs/conference-news' + query, {headers});
  }

  getVendors() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/conference/vendors', {headers});
  }

  classesForCheckout() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/checkout', {headers});
  }

  submitBluesheet(records) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/checkout', {...records}, {headers, responseType: 'blob'});
  }

  downloadPdfSchedule() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/conference/pdf/classroom', {headers, responseType: 'blob'});
  }

  addClassToCustomSchedule(classId) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/custom-schedules/add', {classId}, {headers});
  }

  removeClassFromCustomSchedule(classId) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/custom-schedules/remove', {classId}, {headers});
  }

  getCustomSchedule() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/custom-schedules', {headers});
  }

  downloadCustomSchedule() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/custom-schedules/pdf', {headers, responseType: 'blob'});
  }

  getSignedMaterialUpload(id, file, filename) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/instructor-tools/get-signed-upload', {id, contenttype: file.type, filename}, {headers});
  }

  uploadFile(url: string, file: File) {
    const headers = new HttpHeaders({'Content-Type': file.type, 'External': 'true'});
    return this.http.put(url, file, {headers});
  }

  makeFileRecord(filename, eventId, title) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/instructor-tools/add-material', {filename, eventId, title}, {headers});
  }

  downloadFile(filename) {
    const headers = new HttpHeaders({'Content-Type': 'application/json', 'External': 'true'});
    return this.http.get(environment.FILES + '/' + filename, {headers, responseType: 'blob'});
  }

  deleteMaterial(id) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/instructor-tools/delete-material', {id}, {headers});
  }

  getInstructors() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/conference/instructors', {headers});
  }

}
