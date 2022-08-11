export class UserState {
    isLoggedIn: boolean;
    _id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    token?: string;
    refresh?:string;
    socket?:string;
    memberLevel?:string;
    groups?: string[];
    isMember?: boolean;
    isAdmin?:boolean;
    isEducator?:boolean;
    isAttendee?:boolean;
    attendeePending?:boolean;
    isDeveloper?:boolean;
    isInstructor?:boolean;
    hasAddress?:boolean;
    hasInstructorInfo?:boolean;
    passwordIsTemp?:boolean;
    region?:string;
    checkedOut?:boolean;
}