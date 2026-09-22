import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DemandeCreationEvenement, DemandeCreationEvenementFormulaire, Evenement } from '../models';

@Injectable({ providedIn: 'root' })
export class DemandeCreationEvenementService {
  private readonly apiUrl = `${environment.url}demandes-evenements`;

  constructor(private http: HttpClient) {}

  creer(demande: DemandeCreationEvenementFormulaire): Observable<DemandeCreationEvenement> {
    return this.http.post<DemandeCreationEvenement>(this.apiUrl, demande);
  }

  getAll(): Observable<DemandeCreationEvenement[]> {
    return this.http.get<DemandeCreationEvenement[]>(this.apiUrl);
  }

  valider(id: number): Observable<Evenement> {
    return this.http.post<Evenement>(`${this.apiUrl}/${id}/valider`, {});
  }
}
