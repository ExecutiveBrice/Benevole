import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient,HttpParams} from "@angular/common/http";
import {Benevole} from '../models';

@Injectable()
export class BenevoleService {
  apiUrl = environment.apiUrl + '/benevole';

  constructor(
    private http: HttpClient
  ) { }

  getAll() {
    return this.http.get<Benevole[]>(this.apiUrl + '/getAll', {responseType: 'json'});
  }

  get(id) {
    let params = new HttpParams().set('id', ''+id+'');
    return this.http.get<Benevole>(this.apiUrl + '/', {params, responseType: 'json'});
  }

  
  getByMail(email:String) {
    let params = new HttpParams().set('email', ''+email+'');
    return this.http.get(this.apiUrl + '/byMail', {params, responseType: 'json'});
  }

  add(benevole:Benevole) {
    return this.http.post<Benevole>(this.apiUrl + '/', benevole, {responseType: 'json'});
  }

  update(benevole:Benevole) {
    return this.http.put<Benevole>(this.apiUrl + '/', benevole, {responseType: 'json'});
  }

  
  error(benevole:Benevole) {
    return this.http.post<Benevole>(this.apiUrl + '/error', benevole, {responseType: 'json'});
  }
}
