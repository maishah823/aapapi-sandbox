import { trigger, query, state, style, transition, animate } from '@angular/animations';

export const spin = trigger('spin', [
    transition(
        ':enter', [
            animate('5s 500ms', style({ transform: 'rotate(5)'}))

        ])
]);