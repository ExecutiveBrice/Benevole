import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { Evenement } from '../models';

@Injectable()
export class EvenementService {
  apiUrl = 'evenement';

  constructor(
    private http: HttpClient
  ) { }

  getAll() {
    return this.http.get<Evenement[]>(this.apiUrl + '/getAll', {responseType: 'json'});
  }
  getById(id:number) {
    let params = new HttpParams().set('id', ''+id+'');
    return this.http.get<Evenement>(this.apiUrl + '/getById', {params, responseType: 'json'});
  }
  ajout(creneau:Evenement) {
    return this.http.post<Evenement>(this.apiUrl + '/', creneau, {responseType: 'json'});
  }
  update(creneau:Evenement) {
    return this.http.put<Evenement>(this.apiUrl + '/', creneau, {responseType: 'json'});
  }
  updateAffiche(id:number, affiche:string) {
    let params = new HttpParams().set('id', ''+id+'');
    return this.http.put<Evenement>(this.apiUrl + '/updateAffiche', affiche, {params, responseType: 'json'});
  }
  delete(creneau:Evenement) {
    let params = new HttpParams().set('id', ''+creneau.id+'');
    return this.http.delete(this.apiUrl + '/', {params, responseType: 'json'});
  }
  isAuthorize(id:number, password:string) {
    let params = new HttpParams().set('id', '' + id + '').set('password', '' + password + '');
    return this.http.get<boolean>(this.apiUrl + '/isAuthorize', {params, responseType: 'json'});
  }
  isOpen(id:number) {
    let params = new HttpParams().set('id', '' + id + '');
    return this.http.get<boolean>(this.apiUrl + '/isOpen', {params, responseType: 'json'});
  }
  opening(id:number) {
    let params = new HttpParams().set('id', '' + id + '');
    return this.http.put<boolean>(this.apiUrl + '/opening', null, {params, responseType: 'json'});
  }
  
  getAffiche(id:number) {
    let params = new HttpParams().set('id', '' + id + '');
    return this.http.get(this.apiUrl + '/getAffiche', {params, responseType: 'text'});
  }
  getLogo(id:number) {
    let params = new HttpParams().set('id', '' + id + '');
    return this.http.get(this.apiUrl + '/getLogo', {params, responseType: 'text'});
  }
}
