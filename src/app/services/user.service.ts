import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from "@angular/common/http";
import { Subject } from 'rxjs';
import { User } from '../models';

@Injectable()
export class UserService {
  apiUrl = environment.apiUrl + '/user';

  constructor(
    private http: HttpClient
  ) { }


      // Observable string sources
      private utilisateurSource = new Subject<User>();

      // Observable string streams
      utilisateurSource$ = this.utilisateurSource.asObservable();
  
      // Service message commands
      sourceUtilisateur(utilisateur: User) {
          console.log('sourceUtilisateur')
          console.log(utilisateur)
          this.utilisateurSource.next(utilisateur);
      }


  signup(user) {
    return this.http.post(this.apiUrl + '/signup', user);
  }

  login(user) {
    return this.http.post(this.apiUrl + '/login', user);
  }

}
