import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable()
export class ConfigService {
  apiUrl = environment.apiUrl + '/config';

  constructor(
    private http: HttpClient
  ) { }

  getParam(param:String) {
    let params = new HttpParams().set('param', ''+param+'');
    return this.http.get(this.apiUrl + "/", {params, responseType: 'json' });
  }

  updateParam(param:String, value:String) {
    let params = new HttpParams().set('param', ''+param+'').set('value', ''+value+'');
    
    return this.http.put(this.apiUrl + "/", params, { responseType: 'json' })
  }
}
