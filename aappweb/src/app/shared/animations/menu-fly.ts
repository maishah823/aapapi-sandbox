import { trigger, style, group, transition, animate, query, stagger } from '@angular/animations';

export const menuFly = trigger('menuFly', [
    //state('closed', style({transform: 'translateX(-50%)'})),
    transition(
        'closed => opened', group([
            query('a', style({ transform: 'translateX(-300%)' }), {optional:true}),
            query('h3', style({ opacity: 0 }), {optional:true}),
            query('.mat-divider', style({ opacity: 0 }), {optional:true}),
            query('a',
                stagger(
                    '50ms',
                    [animate('300ms ease-in-out', style({ transform: 'translateX(0)' }))]
                ), {optional:true}
            ),
            query('h3',
                animate('600ms 400ms ease-in-out', style({ opacity: 1 })), {optional:true}
            ),
            query('.mat-divider',
                    animate('400ms 300ms ease-out', style({ opacity: 1 })), {optional:true}
            )    
            
        ])
    )

]);