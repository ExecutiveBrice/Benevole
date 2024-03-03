import { EventEmitter, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Evenement } from '../models';


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


  public someEvent: EventEmitter<string> = new EventEmitter();



}