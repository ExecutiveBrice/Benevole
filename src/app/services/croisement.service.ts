import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient,HttpParams} from "@angular/common/http";
import { Croisement } from '../models';

@Injectable()
export class CroisementService {
  apiUrl = environment.apiUrl + '/croisement';

  constructor(
    private http: HttpClient
  ) { }


  getAll() {
    return this.http.get<Croisement[]>(this.apiUrl + '/getAll', {responseType: 'json'});
  }
  
  getByStand(id:number) {
    let params = new HttpParams().set('id', ''+id+'');
    return this.http.get(this.apiUrl + '/getByStand', {params, responseType: 'json'});
  }
    
  getByCreneau(id:String) {
    let params = new HttpParams().set('id', ''+id+'');
    return this.http.get(this.apiUrl + '/getByCreneau', {params, responseType: 'json'});
  }
}
