import { Pipe, PipeTransform } from '@angular/core';
import {log} from "@angular-devkit/build-angular/src/builders/ssr-dev-server";

@Pipe({
    name: 'listFilter'
})
export class ListFilterPipe implements PipeTransform {
    transform(items: any[], key:string, values:string[]): any {


        // filter items array, items which match and return true will be
        // kept, false will be filtered out
        return items.filter(item => values.filter(value => {

          return value == item[key]
          }).length == 0
        );
    }
}
