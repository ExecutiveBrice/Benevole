import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient,HttpParams} from "@angular/common/http";

@Injectable()
export class MailService {
  apiUrl = environment.apiUrl + '/email';

  constructor(
    private http: HttpClient
  ) { }


  send(texte:String) {
    return this.http.post(this.apiUrl + '/', texte, {responseType: 'json'});
  }
  

}
