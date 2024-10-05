import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { Stand } from '../models';
import { environment } from '../../environments/environment';

@Injectable()
export class StandService {
  apiUrl = environment.url+'stand';

  constructor(
    private http: HttpClient
  ) { }


  getAll(eventId: number) {
    let params = new HttpParams().set('eventId', ''+eventId+'');
    return this.http.get<Stand[]>(this.apiUrl + '/getAll', {params, responseType: 'json'});
  }
  getById(id:number, eventId: number) {
    let params = new HttpParams().set('id', ''+id+'').set('eventId', ''+eventId+'');
    return this.http.get(this.apiUrl + '/getById', {params, responseType: 'json'});
  }
  ajout(stand:Stand, eventId: number) {
    let params = new HttpParams().set('eventId', ''+eventId+'');
    return this.http.post<Stand>(this.apiUrl + '/', stand, {params, responseType: 'json'});
  }
  update(stand:Stand) {
    return this.http.put<Stand>(this.apiUrl + '/', stand, {responseType: 'json'});
  }
  delete(standId:number) {
    let params = new HttpParams().set('standId', ''+standId+'');
    return this.http.delete(this.apiUrl + '/', {params, responseType: 'json'});
  }
  
}
