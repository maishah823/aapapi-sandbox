import {Component, OnDestroy, OnInit, ViewContainerRef} from '@angular/core';
import {SwUpdate} from '@angular/service-worker';

import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {WindowAgentService} from './window-agent.service';

import {UserState} from '@shared/state';
// tslint:disable-next-line:import-blacklist
import {interval, Subscription, timer} from 'rxjs';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  updateSub: Subscription;
  intervalSub: Subscription;

  showIPhoneInstall = false;
  showIPadInstall = false;
  showAndroidInstall = false;
  deferredPrompt: any;

  constructor(public viewRef: ViewContainerRef, private update: SwUpdate, private router: Router,
              private store: Store<any>, private devices: WindowAgentService) {
  }

  ngOnInit() {

    this.updateSub = this.update.available.subscribe(() => {
      if (this.devices.isStandAlone()) {
        window.location.reload();
        // window.location.reload(true);
      } else {
        location.reload();
      }
    });
    this.update.checkForUpdate();

    this.intervalSub = interval(1000 * 60 * 60).subscribe(() => {
      this.update.checkForUpdate();
    });


    this.store.select('user').pipe(take(1)).subscribe((user: UserState) => {
      if (user.isAttendee && this.devices.isStandAlone()) {
        this.router.navigate(['/web/conf/conf-start']);
      } else if (user.isLoggedIn) {
        this.router.navigate(['/web/start']);
      } else {
        const hasVisited = localStorage.getItem('hasVisited');
        // if (hasVisited && !this.devices.isStandAlone()) {
        //   this.router.navigate(['/web/start']);
        // }else{
        //   this.router.navigate(['/']);
        // }
        // localStorage.setItem('hasVisited', 'true');

      }
    });

    // CHECK IF IS IPHONE OR IPAD
    if (this.devices.iPhone() && !this.devices.isStandAlone()) {
      this.showIPhoneInstall = true;
      this.showIPadInstall = false;
    } else if (this.devices.iPad() && !this.devices.isStandAlone()) {
      this.showIPhoneInstall = true;
      this.showIPadInstall = false;
    }

    timer(10000).subscribe(() => {
      this.showIPhoneInstall = false;
    });

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showAndroidInstall = true;

    });

  }


  ngOnDestroy() {
    if (this.updateSub) {
      this.updateSub.unsubscribe();
    }
    if (this.intervalSub) {
      this.intervalSub.unsubscribe();
    }
  }

  androidInstall() {
    this.showAndroidInstall = false;
    this.deferredPrompt.prompt();
    this.deferredPrompt.userChoice
      .then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Accepted.');
        }
      });
  }

  hideInstall() {
    this.showIPhoneInstall = false;
    this.showIPadInstall = false;
    this.showAndroidInstall = false;
  }
}
