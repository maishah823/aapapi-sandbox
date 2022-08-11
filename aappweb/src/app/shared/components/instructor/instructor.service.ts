import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../../environments/environment';

@Injectable()
export class InstructorService {

  constructor(private http: HttpClient) {
  }

  updateInstructor(userId: string, field: string, content: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/users/instructor-update', {userId, field, content}, {headers});
  }

  addTopic(userId: string, topic: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/users/add-topic', {userId, topic}, {headers});
  }

  removeTopic(userId: string, topic: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/users/remove-topic', {userId, topic}, {headers});
  }

  getSignedUploadURL(file: File, newFileName: String) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/users/instructor-sign', JSON.stringify({
      filename: newFileName,
      contenttype: file.type
    }), {headers});
  }

  uploadImage(url: string, file: File) {
    const headers = new HttpHeaders({'Content-Type': file.type, 'External': 'true'});
    return this.http.put(url, file, {headers});
  }

  updateInstructorImage(userId: string, filename: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/users/update-instructor-image', {userId, filename}, {headers});
  }
}
