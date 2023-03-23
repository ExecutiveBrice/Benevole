import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { Email } from '../models';
import { environment } from 'src/environments/environment';

@Injectable()
export class MailService {
  apiUrl = environment.url+'email';

  constructor(
    private http: HttpClient
  ) { }

  autoSendMail(email : Email) {
    return this.http.post(this.apiUrl + "/rappel", email, { responseType: 'json' })
  }

  sendMail(email: Email) {
    return this.http.post(this.apiUrl + "/", email, { responseType: 'json' })
  }
}
