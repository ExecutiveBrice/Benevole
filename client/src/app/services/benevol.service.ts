import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { Benevole } from '../models';
import { environment } from '../../environments/environment';
import {Observable} from "rxjs";

@Injectable()
export class BenevoleService {
  apiUrl = environment.url+'benevole';

  constructor(
    private http: HttpClient
  ) { }

  getAll() {
    return this.http.get<Benevole[]>(this.apiUrl + '/getAll', { responseType: 'json' });
  }

  getById(id: number) {
    let params = new HttpParams().set('id', '' + id + '');
    return this.http.get<Benevole>(this.apiUrl + '/getById', { params, responseType: 'json' });
  }

  getByEvenementId(eventId: number) {
    let params = new HttpParams().set('eventId', '' + eventId + '');
    return this.http.get<Benevole[]>(this.apiUrl + '/getByEvenementId', { params, responseType: 'json' });
  }

  getWithChoice(eventId: number) {
    let params = new HttpParams().set('eventId', '' + eventId + '');
    return this.http.get<Benevole[]>(this.apiUrl + '/getWithChoice', { params, responseType: 'json' });
  }

  getWithOutChoice(eventId: number) {
    let params = new HttpParams().set('eventId', '' + eventId + '');
    return this.http.get<Benevole[]>(this.apiUrl + '/getWithOutChoice', { params, responseType: 'json' });
  }

  deleteById(benevoleId: number) {
    let params = new HttpParams().set('benevoleId', '' + benevoleId + '');
    return this.http.delete<void>(this.apiUrl + '/deleteById', { params, responseType: 'json' });
  }

  getByMail(email: String, eventId: number): Observable<Benevole> {
    let params = new HttpParams().set('email', '' + email + '').set('eventId', '' + eventId + '');
    return this.http.get<Benevole>(this.apiUrl + '/byMail', { params, responseType: 'json' });
  }

  add(benevole: Benevole, eventId: number) {
    let params = new HttpParams().set('eventId', '' + eventId + '');
    return this.http.post<Benevole>(this.apiUrl + '/', benevole, {params, responseType: 'json' });
  }

  update(benevole: Benevole) {
    let lBenevole = new Benevole();
    lBenevole.id = benevole.id
    lBenevole.email = benevole.email
    lBenevole.telephone = benevole.telephone
    lBenevole.nom = benevole.nom
    lBenevole.prenom = benevole.prenom
    return this.http.put<Benevole>(this.apiUrl + '/', lBenevole, { responseType: 'json' });
  }

  removeToCroisement(benevoleId: number, croisementId: number) {
    let params = new HttpParams().set('benevoleId', '' + benevoleId + '').set('croisementId', '' + croisementId + '');
    return this.http.put<Benevole>(this.apiUrl + '/removeToCroisement', {}, { params, responseType: 'json' });
  }

  addToCroisement(benevoleId: number, croisementId: number, force: boolean) {
    let params = new HttpParams().set('benevoleId', '' + benevoleId + '').set('croisementId', '' + croisementId + '').set('force', '' + force + '');
    return this.http.put<Benevole>(this.apiUrl + '/addToCroisement', {}, { params, responseType: 'json' });
  }
  error(benevole: Benevole) {
    return this.http.post(this.apiUrl + '/error', benevole, { responseType: 'json' });
  }
}
