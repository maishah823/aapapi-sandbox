import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../environments/environment';

@Injectable()
export class MembersService {

  constructor(private http: HttpClient) {
  }

  memberListing(page?: number, limit?: number, searchTerm?: string) {
    let guarenteedPage = page || 1;
    let guarenteedLimit = limit || 10;
    let query = `?page=${guarenteedPage}&limit=${guarenteedLimit}`;

    if (searchTerm) {
      query = query + `&search=${searchTerm}`;
    }
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/members/listing' + query, {headers});
  }

  getMemberGalleryImages(page?: number, limit?: number, searchTerm?: string) {
    let guarenteedPage = page || 1;
    let guarenteedLimit = limit || 10;
    let query = `?page=${guarenteedPage}&limit=${guarenteedLimit}`;

    if (searchTerm) {
      query = query + `&album=${searchTerm}`;
    }

    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/members/gallery' + query, {headers});
  }

  getSignedUploadURL(file: File, newFileName: String) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/members/upload-sign', JSON.stringify({
      filename: newFileName,
      contenttype: file.type
    }), {headers});
  }

  uploadImage(url: string, file: any) {
    const headers = new HttpHeaders({'Content-Type': file.type, 'External': 'true'});
    return this.http.put(url, file, {headers, reportProgress: true});
  }

  saveGalleryImage(caption: string, album: string, filename: string) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post(environment.API_URI + '/members/save-gallery-image', {caption, album, filename}, {headers});
  }

  getMemberNews(page?: number, limit?: number) {
    let guarenteedPage = page || 1;
    let guarenteedLimit = limit || 10;
    let query = `?page=${guarenteedPage}&limit=${guarenteedLimit}`;
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.get(environment.API_URI + '/blogs/member-news' + query, {headers});
  }

}
