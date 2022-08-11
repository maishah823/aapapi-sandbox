import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable()
export class EducatorService {

  constructor(private http: HttpClient) { }
 
  students(page?:number,limit?:number,search?:string){
    var guarenteedLimit = limit || 10;
    var guarenteedPage = page || 1;
    var searchquery='';
    if(search){
      searchquery = '&search='+search;
    }
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/school-admin/students?page='+guarenteedPage+'&limit='+guarenteedLimit + searchquery, {headers});
  }

  updateStudent(id:string,fieldname:string,value:any){
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/school-admin/update-student/'+id, {fieldname,value}, {headers});
  }

  addStudent(student:any){
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/school-admin/add-student-educator', {student}, {headers});
  }

}
