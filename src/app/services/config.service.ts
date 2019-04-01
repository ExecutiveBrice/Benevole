import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable()
export class ConfigService {
  apiUrl = environment.apiUrl + '/config';

  constructor(
    private http: HttpClient
  ) { }



  islock() {
    return this.http.get(this.apiUrl + "/isLock", { responseType: 'json' })
  }
  lockUnlock() {
    return this.http.put(this.apiUrl + "/lockUnlock", { responseType: 'json' })
  }
}
