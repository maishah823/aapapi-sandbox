import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {MnFullpageOptions, MnFullpageService} from 'ngx-fullpage';
import {Elastic} from 'gsap';
import 'rxjs/add/observable/timer';
import {Title} from '@angular/platform-browser';
import {Subscription} from 'rxjs';
import {timer} from 'rxjs/internal/observable/timer';

declare var $: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit, OnDestroy {

  timerSub: Subscription;
  hideLogin: Boolean = true;
  hideNav: Boolean;

  options: MnFullpageOptions = new MnFullpageOptions();

  constructor(public fullPageService: MnFullpageService, private title: Title) {
  }

  ngOnInit() {
    this.title.setTitle('Welcome | AAPP');
    let parsedUser: any = {};
    const user = localStorage.getItem('user');
    if (user) {
      try {
        parsedUser = JSON.parse(user);
        if (!parsedUser.isLoggedIn) {
          this.hideLogin = false;
        }
      } catch (e) {
        console.error(e);
      }
    }


    this.timerSub = timer(6000).subscribe(() => {
      this.fullPageService.moveTo(3);
    });
    TweenMax
      .staggerFrom('.brand-text', .75, {
        delay: .5, ease: Elastic.easeOut
          .config(.1, 0.1), opacity: 0, x: '100', y: '100'
      });
    TweenMax.from('.overlay-button', 1, {delay: 3.5, ease: Elastic.easeOut.config(.5, 0.5), right: '-250'});
    TweenMax.from('.scroll-down-instructions', 1, {delay: 2, ease: Elastic.easeOut.config(.5, 0.5), bottom: '-300'});
  }

  ngOnDestroy() {
    this.fullPageService.destroy('all');
    $(document).off('keydown');

  }

  onLeave(lastIndex, nextIndex) {
    this.hideNav = nextIndex === 2;
    if (this.timerSub) {
      this.timerSub.unsubscribe();
    }
  }


}
