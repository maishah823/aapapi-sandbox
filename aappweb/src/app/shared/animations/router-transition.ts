import { trigger, animate, style, group, animateChild, query, stagger, transition } from '@angular/animations';

export const routerTransition = trigger('routerTransition', [
    transition('* <=> *', [

        query(':enter, :leave', style({display:'block', transform:'scale(1)',position:'absolute', top:0,left:0}), { optional: true }),
        group([
            query(':enter', [
                style({ opacity:'0'}),
                animate('1s ease-in-out', style({'opacity':'1'}))
            ], { optional: true }),

            query(':leave', [
                animate('0.2s ease-in-out', style( {opacity: 0}))
            ], { optional: true })
        ])
    ])
]);