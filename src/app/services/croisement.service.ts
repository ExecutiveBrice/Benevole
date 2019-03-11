import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient,HttpParams} from "@angular/common/http";
import { Croisement } from '../models';

@Injectable()
export class CroisementService {
  apiUrl = environment.apiUrl + '/stand';

  constructor(
    private http: HttpClient
  ) { }


  getAll() {
    return this.http.get<Croisement[]>(this.apiUrl + '/getAll', {responseType: 'json'});
  }

}
