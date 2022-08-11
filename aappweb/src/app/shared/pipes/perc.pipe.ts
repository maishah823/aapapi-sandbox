import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'perc'
})
export class PercPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    var decimal = parseFloat(value);
    var percentage = decimal * 100;
    return percentage.toFixed(2) + '%';

  }

}
