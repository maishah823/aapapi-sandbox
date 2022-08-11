import { trigger, style, animateChild, transition, animate, query } from '@angular/animations';

export const chatbubble = trigger('chatbubble', [
    transition(
        ':enter',
        [style({ transform:'scale(1,0)'}),
        animate('300ms ease-in-out', style({transform:'scale(1,1)'}))]
    )

]);