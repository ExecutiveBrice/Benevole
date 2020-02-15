import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";


@Injectable()
export class SMSService {
  apiUrl = 'http://90.105.98.204:9999/';

  constructor(
    private http: HttpClient
  ) { }


  send(numero:string, message:string) {
    let params = new HttpParams().set('input1', ''+numero+'').set('input2', ''+message+'');

    return this.http.get(this.apiUrl + 'get', {params, responseType: 'json'});
  }


}
