import { Pipe, PipeTransform } from '@angular/core'
import { FormGroup } from '@angular/forms';

@Pipe({
  name: 'orderObjectBy',
  standalone: true
})
export class OrderObjectByPipe implements PipeTransform {
  transform(values: any, key: string, reverse?: boolean) {

    if (!Array.isArray(values) || values.length <= 0) {
      return null;
    }
    if (reverse) {
      return values.sort((a: any, b: any): number => Number(a[key.split('.')[0]][key.split('.')[1]]) - Number(b[key.split('.')[0]][key.split('.')[1]])).reverse();
    } else {
      return values.sort((a: any, b: any): number => Number(a[key.split('.')[0]][key.split('.')[1]]) - Number(b[key.split('.')[0]][key.split('.')[1]]));
    }


  }

}