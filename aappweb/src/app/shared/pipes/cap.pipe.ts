import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cap'
})
export class CapPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if(value && typeof value == 'string'){
      return value.charAt(0).toUpperCase() + value.substr(1,value.length);
    }
    return value;
  }

}
