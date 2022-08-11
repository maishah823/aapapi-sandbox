import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'eventLineSort'
})
export class EventLineSortPipe implements PipeTransform {

  transform(array: Array<any>, args?: any): any {

    array.sort((a: any, b: any) => {
    
      if (a.startDateTime < b.startDateTime) {
        return -1;
      } else if (a.startDateTime > b.startDateTime) {
        return 1;
      } else {
        return 0;
      }
    });
    return array;
  }

}
