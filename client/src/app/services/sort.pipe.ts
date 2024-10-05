import {Pipe, PipeTransform} from '@angular/core'

@Pipe({
  name: 'orderBy',
  standalone: true
})
export class OrderByPipe implements PipeTransform {
  transform(values: number[]|string[]|object[], key?: string, reverse?: boolean) {
    if (!Array.isArray(values) || values.length <= 0) {
      return null;
    }

    return this.sort(values, key, reverse);
  }

  private sort(value: any[], key?: any, reverse?: boolean): any[] {
    const isInside = key && key.indexOf('.') !== -1;

    if (isInside) {
      key = key.split('.');
    }

    const array: any[] = value.sort((a: any, b: any): number => {
      if (!key) {
        return a > b ? 1 : -1;
      }

      if (!isInside) {
        return a[key] > b[key] ? 1 : -1;
      }

      return this.getValue(a, key) > this.getValue(b, key) ? 1 : -1;
    });

    if (reverse) {
      return array.reverse();
    }

    return array;
  }

  private getValue(object: any, key: string[]) {
    for (let i = 0, n = key.length; i < n; ++i) {
      const k = key[i];
      if (!(k in object)) {
        return;
      }

      object = object[k];
    }

    return object;
  }

}