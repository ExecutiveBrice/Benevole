import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient,HttpParams} from "@angular/common/http";
import {Produit } from '../models';

@Injectable()
export class ProduitService {
  apiUrl = environment.apiUrl + '/produit';

  constructor(
    private http: HttpClient
  ) { }

  getAll() {
    return this.http.get(this.apiUrl + '/getAll', {responseType: 'json'});
  }

  get(id) {
    let params = new HttpParams().set('id', ''+id+'');
    return this.http.get<Produit>(this.apiUrl + '/', {params, responseType: 'json'});
  }

  add(produit:Produit) {
    return this.http.post<Produit>(this.apiUrl + '/', produit, {responseType: 'json'});
  }

  update(produit:Produit) {
    return this.http.put<Produit>(this.apiUrl + '/', produit, {responseType: 'json'});
  }
}
