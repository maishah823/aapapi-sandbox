import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phone'
})
export class PhonePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if(value && typeof value == 'string'){
      var stripped = value.replace(/^1|\D/g,'');
      if (stripped.length === 10){
        let areacode = stripped.substr(0,3);
        let exchange = stripped.substr(3,3);
        let number = stripped.substr(6,4);
        return `(${areacode}) ${exchange}-${number}`
      }
    }
    return 'None';
  }

}
