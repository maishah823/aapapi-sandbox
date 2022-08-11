import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roman'
})
export class RomanPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    switch (value){
      case 1:
      return "I";
      case 2: 
      return "II";
      case 3:
      return "III";
      case 4:
      return "IV";
      case 5:
      return "V";
      case 6:
      return "Undetermined";
      default:
      return value;
    }
  }

}
