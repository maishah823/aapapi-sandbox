import { trigger, style, group, transition, animate, query, stagger } from '@angular/animations';

export const slideInFromBottom = trigger('slideInFromBottom', [
    //state('closed', style({transform: 'translateX(-50%)'})),
    transition(
        ':enter', group([
            query('.section-animation-container', style({height:'auto',overflow:'auto'}),{optional:true}),
            query('.section', style({ transform: 'translateY(1500px)'}), {optional:true}),
            query('.section',
                stagger(
                    '200ms',
                    [animate('400ms ease-in-out', style({ transform: 'translateY(0)'}))]
                ), {optional:true}
            )
            
        ])
    )

]);