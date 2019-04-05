import { Croisement } from './../models/croisement';
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
    return this.http.get(this.apiUrl + '/getAll', {responseType: 'json'});
  }

  get(id) {
    let params = new HttpParams().set('id', ''+id+'');
    return this.http.get(this.apiUrl + '/', {params, responseType: 'json'});
  }

  
  getByMail(email:String) {
    let params = new HttpParams().set('email', ''+email+'');
    return this.http.get(this.apiUrl + '/byMail', {params, responseType: 'json'});
  }

  add(benevole:Benevole) {
    return this.http.post(this.apiUrl + '/', benevole, {responseType: 'json'});
  }

  update(benevole:Benevole) {
    return this.http.put(this.apiUrl + '/', benevole, {responseType: 'json'});
  }
  addCroisements(benevole:Benevole) {
   let benevoleRef = benevole
   benevoleRef.Croisements.forEach(croisement => {
    croisement.Benevoles = null;
  });
    return this.http.put(this.apiUrl + '/addCroisements', benevoleRef, {responseType: 'json'});
  }

  
  error(benevole:Benevole) {
    return this.http.post(this.apiUrl + '/error', benevole, {responseType: 'json'});
  }
}
