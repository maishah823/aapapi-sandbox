import { School } from './School';
import { Address } from './Address';

export class User{
    firstName:string;
    lastName:string;
    email:string;
    address?:Address;
    fullname:string;
    groups?: string[];
    school?:School;
    adminForSchool?:School;
    isMember?:boolean;
    isAdmin?:boolean;
    isDelinquentDues?:boolean;
    isEducator?:boolean;
    isAttendee?:boolean;
    isDeveloper?:boolean;
    memberLevel?:string;
    region?:number;
    memberInfo?:any;
    isInstructor?:boolean;
    instructorInfo?:any;
    memberNumber?:string;
}
