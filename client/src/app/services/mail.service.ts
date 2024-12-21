import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { Email } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MailService {
  apiUrl = environment.url+'email';

  constructor(
    private http: HttpClient
  ) { }


  sendMail(email: Email) {
    return this.http.post(this.apiUrl + "/", email, { responseType: 'json' })
  }
}
