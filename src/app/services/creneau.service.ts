import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from "@angular/common/http";
import { Creneau } from '../models';

@Injectable()
export class CreneauService {
  apiUrl = environment.apiUrl + '/creneau';

  constructor(
    private http: HttpClient
  ) { }

  getAll() {
    return this.http.get<Creneau[]>(this.apiUrl + '/getAll', {responseType: 'json'});
  }
  ajout(creneau:Creneau) {
    return this.http.post(this.apiUrl + '/', creneau, {responseType: 'json'});
  }
  update(creneau:Creneau) {
    return this.http.put(this.apiUrl + '/', creneau, {responseType: 'json'});
  }
  delete(creneau:Creneau) {
    let params = new HttpParams().set('id', ''+creneau.id+'');
    return this.http.delete(this.apiUrl + '/', {params, responseType: 'json'});
  }
  
}
