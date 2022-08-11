import { trigger, style, animateChild, transition, animate, query} from '@angular/animations';

export const slideInFromRight = trigger('slideInFromRight', [
    transition(
        '* => *',
        [
            query('@slideInFromRightChild', [animateChild()], {optional:true})
        ]
        

    ),
    transition(
        '* => *',
        [
            query(':leave',
                animate('1000ms ease-in-out', style({ opacity: 0, height: 0})), { optional: true }
            )
        ]
        

    )

]);

export const slideInFromRightChild = trigger('slideInFromRightChild', [
   
        transition(':enter', [
          style({ opacity: 0, transform:'translate(500px,0)' }),
          animate(500, style({ opacity: 1, transform:'translate(0,0)' }))
        ]),

        transition(':leave', [
            animate(500, style({ height: 0, opacity: 0, transform: 'rotateX(-90deg)' }))
          ])

]);