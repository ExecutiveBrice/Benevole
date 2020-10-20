import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from "@angular/common/http";
import { Croisement } from '../models';

@Injectable()
export class CroisementService {
  apiUrl = 'croisement';

  constructor(
    private http: HttpClient
  ) { }


  getAll() {
    return this.http.get(this.apiUrl + '/getAll', {responseType: 'json'});
  }
  getById(id:number) {
    let params = new HttpParams().set('id', ''+id+'');
    return this.http.get(this.apiUrl + '/getById', {params, responseType: 'json'});
  }
    
  getByStand(id:number) {
    let params = new HttpParams().set('id', ''+id+'');
    return this.http.get(this.apiUrl + '/getByStand', {params, responseType: 'json'});
  }
    
  getByCreneau(id:String) {
    let params = new HttpParams().set('id', ''+id+'');
    return this.http.get(this.apiUrl + '/getByCreneau', {params, responseType: 'json'});
  }
    
  getByEtat(etat:number) {
    let params = new HttpParams().set('etat', ''+etat+'');
    return this.http.get(this.apiUrl + '/getByEtat', {params, responseType: 'json'});
  }
  ajout(croisement:Croisement) {
    return this.http.post(this.apiUrl + '/', croisement, {responseType: 'json'});
  }
  update(croisement:Croisement) {
    return this.http.put(this.apiUrl + '/', croisement, {responseType: 'json'});
  }
  delete(croisement:Croisement) {
    let params = new HttpParams().set('id', ''+croisement.id+'');
    return this.http.delete(this.apiUrl + '/', {params, responseType: 'json'});
  }
}
