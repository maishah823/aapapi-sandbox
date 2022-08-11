import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../../../environments/environment';

@Injectable()
export class SchoolService {

  constructor(private http: HttpClient) {
  }

  getSchools(page?: number, limit?: number, search?: string) {
    let guarenteedLimit = limit || 10;
    let guarenteedPage = page || 1;
    let searchquery;
    if (search) {
      searchquery = '&search=' + search;
    }

    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/school-admin/schools?page='
      + guarenteedPage + '&limit=' + guarenteedLimit + searchquery, {headers});
  }

  addSchool(school: Object) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/school-admin/schools', {school}, {headers});
  }

  getSchoolStats(page?: number, limit?: number, search?: string) {
    let guarenteedLimit = limit || 10;
    let guarenteedPage = page || 1;
    let searchquery;
    if (search) {
      searchquery = '&search=' + search;
    }
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/school-admin/stats?page=' + guarenteedPage + '&limit=' + guarenteedLimit + searchquery, {headers});
  }

  getSchoolAdmins(page?: number, limit?: number, search?: string) {
    let guarenteedLimit = limit || 10;
    let guarenteedPage = page || 1;
    let searchquery;
    if (search) {
      searchquery = '&search=' + search;
    }
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/school-admin/administrators?page=' + guarenteedPage + '&limit=' + guarenteedLimit + searchquery, {headers});
  }

  addSchoolAdmin(admin: Object) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/school-admin/add-school-admin', {admin}, {headers});
  }

  getStudents(page: number, limit: number, school?: string) {
    let guarenteedLimit = limit || 10;
    let guarenteedPage = page || 1;
    let searchquery;
    if (school) {
      searchquery = '&school=' + school;
    }
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/school-admin/admin-students?page=' + guarenteedPage + '&limit=' + guarenteedLimit + searchquery, {headers});
  }

  updateStudent(id: string, fieldname: string, value: any) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/school-admin/update-student/' + id, {fieldname, value}, {headers});
  }

  addStudent(student: any) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/school-admin/add-student-admin', {student}, {headers});
  }

}
