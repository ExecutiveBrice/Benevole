import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from "@angular/common/http";
import { Config, Evenement } from '../models';

@Injectable()
export class ConfigService {
  apiUrl = environment.apiUrl + '/config';

  constructor(
    private http: HttpClient
  ) { }

  getAll() {
    return this.http.get(this.apiUrl + '/getAll', {responseType: 'json'});
  }

  create(event:Evenement) {
    return this.http.post(this.apiUrl + '/', event, {responseType: 'json'});
  }

  getParam(param:string) {
    let params = new HttpParams().set('param', ''+param+'');
    return this.http.get(this.apiUrl + "/", {params, responseType: 'json' });
  }

  updateParam(config:Config) {
    let params = new HttpParams().set('param', ''+config.param+'').set('value', ''+config.value+'');
    
    return this.http.put(this.apiUrl + "/", params, { responseType: 'json' })
  }
}
