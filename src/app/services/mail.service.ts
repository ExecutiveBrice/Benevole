import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient,HttpParams} from "@angular/common/http";
import { Email } from '../models';
@Injectable()
export class MailService {
  apiUrl = environment.apiUrl + '/email';

  constructor(
    private http: HttpClient
  ) { }



  sendMail (email:Email){
    return this.http.post(this.apiUrl+"email/",email, {responseType: 'json'})
}
}