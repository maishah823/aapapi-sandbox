import {trigger, transition, animate} from '@angular/animations';

export const swell = trigger('swell', [
    transition('* => *', animate('100ms ease-in'))
]);