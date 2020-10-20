import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from "@angular/common/http";
import { Stand } from '../models';

@Injectable()
export class StandService {
  apiUrl = '/stand';

  constructor(
    private http: HttpClient
  ) { }


  getAll() {
    return this.http.get<Stand[]>(this.apiUrl + '/getAll', {responseType: 'json'});
  }
  getById(id:number) {
    let params = new HttpParams().set('id', ''+id+'');
    return this.http.get(this.apiUrl + '/getById', {params, responseType: 'json'});
  }
  ajout(stand:Stand) {
    return this.http.post(this.apiUrl + '/', stand, {responseType: 'json'});
  }
  update(stand:Stand) {
    return this.http.put(this.apiUrl + '/', stand, {responseType: 'json'});
  }
  delete(stand:Stand) {
    let params = new HttpParams().set('id', ''+stand.id+'');
    return this.http.delete(this.apiUrl + '/', {params, responseType: 'json'});
  }
  
}
