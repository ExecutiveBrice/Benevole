/* tslint:disable use-pipe-transform-interface */
import { Pipe, PipeTransform } from '@angular/core';



@Pipe({ name: 'sort' })
export class SortPipe implements PipeTransform {
  transform(list: any[]) {

    return list.sort((a,b) => a.nom.localeCompare(b.nom));
   
  }
}