import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Params } from '../models/params';

@Injectable()
export class ConfigService {
  apiUrl = environment.url+'config';

  constructor(
    private http: HttpClient
  ) { }

  getParams():Observable<Params> {
    return this.http.get<Params>(this.apiUrl + '/getParams', { responseType: 'json'});
  }


  completeTemplate(text:string, event_name:string, using_address:string, managing_address:string):string {
    while(text.match("<event_name>")){
      text= text.replace("<event_name>",event_name)
    }

    while(text.match("<using_address>")){
      text= text.replace("<using_address>",using_address)
    }

    while(text.match("<managing_address>")){
      text= text.replace("<managing_address>",managing_address)
    }

    return text
  }




}
