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

    // Observable string sources
    private toggleSource = new Subject<boolean>();

    // Observable string streams
    toggleStream = this.toggleSource.asObservable();
  
    // Service message commands
    toggleTransmission(toggle: boolean) {
      this.toggleSource.next(toggle);
    }

  public someEvent: EventEmitter<string> = new EventEmitter();



}