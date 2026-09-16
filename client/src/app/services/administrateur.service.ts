import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface AdministrateurConnecte {
  id: number;
  username: string;
  enabled: boolean;
  evenementIds: number[];
}

@Injectable({ providedIn: 'root' })
export class AdministrateurService {
  constructor(private http: HttpClient) {}

  moi() {
    return this.http.get<AdministrateurConnecte>(`${environment.url}administrateurs/moi`);
  }
}
