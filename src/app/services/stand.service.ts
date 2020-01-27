import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient,HttpParams} from "@angular/common/http";
import { Stand } from '../models';

@Injectable()
export class StandService {
  apiUrl = environment.apiUrl + '/stand';

  constructor(
    private http: HttpClient
  ) { }


  getAll() {
    return this.http.get<Stand[]>(this.apiUrl + '/getAll', {responseType: 'json'});
  }
  
  update(stand:Stand) {
    return this.http.put(this.apiUrl + '/', stand, {responseType: 'json'});
  }
  
  delete(stand:Stand) {
    return this.http.delete(this.apiUrl + '/' + stand.id, {responseType: 'json'});
  }
  
}
