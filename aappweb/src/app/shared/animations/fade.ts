import { trigger, query, state, style, transition, animate } from '@angular/animations';

export const fade = trigger('fade', [
    transition(
        ':enter', [
            style({opacity:0}),
            animate('300ms ease-in', style({ opacity:1 }))

        ]),
    transition(
        ':leave', [
            style({opacity:1}),
            animate('200ms ease-in', style({ opacity:0 }))

        ])
]);