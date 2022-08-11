import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'instructorFilter'
})
export class InstructorFilterPipe implements PipeTransform {

  transform(instructors: any, args?: any): any {
    if (!args.topics || !Array.isArray(args.topics) || args.topics.length < 1) {
      return instructors;
    }
    return instructors.filter((instructor) => {
      if (!instructor.instructorInfo || !instructor.instructorInfo.topics ||
        !Array.isArray(instructor.instructorInfo.topics) ||
        instructor.instructorInfo.topics.length < 1) {
        return instructor;
      }
      let goodInstructor = false;
      instructor.instructorInfo.topics.forEach((topic) => {
        if (args.topics.indexOf(topic) > -1) {
          goodInstructor = true;
        }
      });
      if (goodInstructor) {
        return instructor;
      }
    });
  }

}
