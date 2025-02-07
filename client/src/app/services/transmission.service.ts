import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
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


  // Observable string sources
  private benevoleSource = new Subject<Benevole>();

  // Observable string streams
  benevoleStream = this.benevoleSource.asObservable();

  // Service message commands
  benevoleTransmission(benevole: Benevole) {
    this.benevoleSource.next(benevole);
  }



}