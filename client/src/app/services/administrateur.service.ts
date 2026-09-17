import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface AdministrateurConnecte {
  id: number;
  username: string;
  enabled: boolean;
  superadmin: boolean;
  evenementIds: number[];
}

export interface AdministrateurCreation {
  username: string;
  superadmin: boolean;
  evenementIds: number[];
}

export interface AdministrateurMiseAJour {
  username: string;
  password: string | null;
  enabled: boolean;
  superadmin: boolean;
  evenementIds: number[];
}

@Injectable({ providedIn: 'root' })
export class AdministrateurService {
  constructor(private http: HttpClient) {}

  moi() {
    return this.http.get<AdministrateurConnecte>(`${environment.url}administrateurs/moi`);
  }

  getAll() {
    return this.http.get<AdministrateurConnecte[]>(`${environment.url}administrateurs`);
  }

  creer(administrateur: AdministrateurCreation) {
    return this.http.post<AdministrateurConnecte>(`${environment.url}administrateurs`, administrateur);
  }

  mettreAJour(id: number, administrateur: AdministrateurMiseAJour) {
    return this.http.put<AdministrateurConnecte>(`${environment.url}administrateurs/${id}`, administrateur);
  }
}
