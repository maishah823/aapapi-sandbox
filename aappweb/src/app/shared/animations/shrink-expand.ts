import { trigger, query, state, style, transition, animate } from '@angular/animations';

export const shrinkExpand = trigger('shrinkExpand', [
    transition(
        ':enter', [
            style({ transform: 'scale(0)', opacity:0}),
            animate('200ms ease-in', style({ transform: 'scale(1)', opacity:1 }))

        ])
]);