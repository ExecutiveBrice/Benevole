import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient,HttpParams} from "@angular/common/http";
import { Reservation } from '../models';

@Injectable()
export class ReservationService {
  apiUrl = environment.apiUrl + '/reservation';

  constructor(
    private http: HttpClient
  ) { }

  get(id) {
    let params = new HttpParams().set('id', ''+id+'');
    return this.http.get(this.apiUrl + '/get', {params});
  }

  add(reservation:Reservation) {
    return this.http.post<Reservation>(this.apiUrl + '/', reservation, {responseType: 'json'});
  }

}
