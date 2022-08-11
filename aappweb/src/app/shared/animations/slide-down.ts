import { trigger, query, state, style, transition, animate } from '@angular/animations';

export const slideDown = trigger('slideDown', [
    transition(
        ':enter', [
            style({top:'-500px'}),
            animate('200ms ease-in', style({ top:0 }))

        ]),
    transition(
        ':leave', [
            style({top:0}),
            animate('200ms ease-in', style({ top:'-500px' }))

        ])
]);