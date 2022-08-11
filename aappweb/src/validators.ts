import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
export const abbv = ["AK",
    "AL",
    "AR",
    "AZ",
    "CA",
    "CO",
    "CT",
    "DC",
    "DE",
    "FL",
    "GA",
    "HI",
    "IA",
    "ID",
    "IL",
    "IN",
    "KS",
    "KY",
    "LA",
    "MA",
    "MD",
    "ME",
    "MI",
    "MN",
    "MO",
    "MS",
    "MT",
    "NC",
    "ND",
    "NE",
    "NH",
    "NJ",
    "NM",
    "NV",
    "NY",
    "OH",
    "OK",
    "OR",
    "PA",
    "PR",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VA",
    "VT",
    "WA",
    "WI",
    "WV",
    "WY"];



export function stateValidator(control: UntypedFormControl) {
    let state = control.value as string;
    if (!state) {
        return { message: "Required" }
    }
    if (abbv.indexOf(state) < 0) {
        return {
            message: "Incorrect State"
        }
    }
    return null;
}

export function zipCodeValidator(control: UntypedFormControl) {
    let value = control.value as string;
    if (!value) {
        return { message: "Required" }
    }
    if (!value.match(/^[0-9]{5}$/)) {
        return {
            message: "Incorrect Zip"
        }
    }
    return null;
}

export function isTrue(control: UntypedFormControl) {
    let state = control.value as boolean;
    if (state) {
        return null;
    }

    return { message: "Pin Required" }
}

export function phoneValidator(control: UntypedFormControl) {
    let phone = control.value;
    if (phone) {
        let stripped = phone.replace(/^1|\D+/g, '');
        if (!stripped.match(/^[0-9]{10}$/)) {
            return {
                message: "Incorrect Phone Number"
            }
        }
    }
    return null;
}

export function memberNumberValidator(control: UntypedFormControl) {
    let number = control.value;
    if(!number){
        return {
            message: "Must have a value"
        }
    }

    if (!number.match(/^\d{1,4}$/)) {
        return {
            message: "Incorrect Member Number"
        }
    }

    return null;
}

export function emailValidator(control: UntypedFormControl) {
    let email = control.value;
    if (typeof email != 'string') {
        return { message: "Incorrect Format" };
    }
    if (email) {
        let [_, domain] = email.split('@');
        if (!domain) {
            return {
                message: "Format must be username@domain.com"
            }
        }
        if (!domain.match(/^[[a-zA-Z0-9\-\.]{1,}\.[a-zA-Z0-9]{1,3}$/)) {
            return {
                message: "Incorrect domain."
            }
        }
    } else {
        return { message: 'Required' }
    }
    return null;
}


export function passwordValidator(control: UntypedFormControl) {
    let pw = control.value;
    if (!pw) {
        return { message: 'Enter a password at least 8 characters long; containing at least one symbol and one number.' };
    }
    if (pw.length < 8) {
        return {
            password: 'Password must be at least 8 characters long.'
        };
    }
    if (pw.match(/\s+/g)) {
        return { password: 'Password must contain at least one symbol.' };
    }
    if (!pw.match(/[^A-Za-z0-9]+/g)) {
        return { password: 'Password must contain at least one symbol.' };
    }

    if (!pw.match(/[\d]+/g)) {
        return { password: 'Password must contain at least one number.' };
    }

    if (!pw.match(/[A-Z]+/g)) {
        return { password: 'Password must contain at least one capital letter.' };
    }
    if (!pw.match(/[a-z]+/g)) {
        return { password: 'Password must contain at least one lowercase letter.' };
    }

    return null;
}

export function hoursValidator(control: UntypedFormControl) {
    let state = control.value as number;
    if (Number.isInteger(state) && state >= 0 && state <= 23) {
        return null;
    }

    return { message: "Outside Range" }
}

export function minutesValidator(control: UntypedFormControl) {
    let state = control.value as number;
    if (Number.isInteger(state) && state >= 0 && state <= 59) {
        return null;
    }

    return { message: "Outside Range" }
}

export function arrayNotEmptyValidator(control: UntypedFormControl) {
    let state = control.value;
    if (Array.isArray(state) && state.length > 0) {
        return null;
    }

    return { message: "Must select at least one." }
}

export function guestValidator(group: UntypedFormGroup) {
    let all = group.get('all').value;
    let events = group.get('events').value;
    if (all || events.length > 0) {
        return null;
    }
    return { 'noevents': true }
}

export function courseHoursValidator(control: UntypedFormControl) {
    let state = control.value as number;
    if (Number.isInteger(state) && state >= 0 && state <= 40) {
        return null;
    }

    return { message: "Outside Range" }
}

export function startRatingValidator(control: UntypedFormControl) {
    let state = control.value as number;
    if (Number.isInteger(state) && state > 0 && state <= 10) {
        return null;
    }

    return { message: "Outside Range" }
}