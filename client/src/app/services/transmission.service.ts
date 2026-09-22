import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Benevole, Evenement } from '../models';


@Injectable()
export class TransmissionService {

  // Observable string sources
  private dataSource = new Subject<Evenement>();

  // Observable string streams
  dataStream = this.dataSource.asObservable();

  // Service message commands
  dataTransmission(evenement: Evenement) {
    this.dataSource.next(evenement);
  }

  // Panneau affiché dans le carrousel mobile de la page évènement.
  // Le planning est le panneau affiché par défaut sur la page événement.
  // Cette valeur doit correspondre à celle du composant racine dès le premier rendu.
  private mobileEventPanelSource = new BehaviorSubject<number>(1);
  mobileEventPanelStream = this.mobileEventPanelSource.asObservable();

  selectMobileEventPanel(panel: number) {
    this.mobileEventPanelSource.next(panel);
  }


  // Observable string sources
  private benevoleSource = new Subject<Benevole>();

  // Observable string streams
  benevoleStream = this.benevoleSource.asObservable();

  // Service message commands
  benevoleTransmission(benevole: Benevole) {
    localStorage.setItem('benevoleEmail', JSON.stringify(benevole.email));
    this.benevoleSource.next(benevole);
  }



}
