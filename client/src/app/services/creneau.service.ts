import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { Creneau } from '../models';
import { environment } from 'src/environments/environment';

@Injectable()
export class CreneauService {
  apiUrl = environment.url+'creneau';

  constructor(
    private http: HttpClient
  ) { }

  getAll(eventId: number) {
    let params = new HttpParams().set('eventId', ''+eventId+'');
    return this.http.get<Creneau[]>(this.apiUrl + '/getAll', {params, responseType: 'json'});
  }
  ajout(creneau:Creneau, eventId: number) {
    let params = new HttpParams().set('eventId', ''+eventId+'');
    return this.http.post(this.apiUrl + '/', creneau, {params, responseType: 'json'});
  }
  update(creneau:Creneau) {

    return this.http.put(this.apiUrl + '/', creneau, { responseType: 'json'});
  }
  delete(creneau:Creneau) {
    let params = new HttpParams().set('creneauId', ''+creneau.id+'');
    return this.http.delete(this.apiUrl + '/', {params, responseType: 'json'});
  }
  
}
