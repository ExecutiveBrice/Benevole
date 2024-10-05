import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from '../../environments/environment';

@Injectable()
export class FileService {
  apiUrl = environment.url + 'files';

  constructor(
    private http: HttpClient
  ) { }

  update(evenementId: number, fileName: string, fileContent: string) {
    let params = new HttpParams().set('evenementId', '' + evenementId + '').set('fileName', '' + fileName + '');
    const fd = new FormData();
    const file = new File([fileContent], fileName);
    fd.append('image', file)
    return this.http.post(this.apiUrl + '/', fileContent, { params, responseType: 'text' });
  }

  get(evenementId: number, fileName: string) {
    let params = new HttpParams().set('evenementId', '' + evenementId + '').set('fileName', '' + fileName + '');
    return this.http.get(this.apiUrl + '/', { params, responseType: 'text' });
  }

}
