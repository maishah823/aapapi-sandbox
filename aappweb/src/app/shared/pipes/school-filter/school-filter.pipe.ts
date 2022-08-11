import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'schoolGroupFilter'
})
export class SchoolFilterPipe implements PipeTransform {

  transform(arrayOfSchoolGroups: any, international: boolean = false): any {
    if (international) {
      return arrayOfSchoolGroups.filter((group) => {
        if (group._id.country != 'United States') {
          return group;
        }
      });
    } else {
      return arrayOfSchoolGroups.filter((group) => {
        if (group._id.country == 'United States') {
          return group;
        }
      });
    }

  }

}
