import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';
import {NavigationEnd, Router} from '@angular/router';
import {version} from '../../../../environments/version';
import {DevInfoComponent} from '@shared/components/dev-info/dev-info.component';
import {TdMediaService} from '@covalent/core/media';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],

})
export class LayoutComponent implements OnInit, OnDestroy {

  routerSub: Subscription;
  routerObs: Observable<NavigationEnd>;
  showAd = false;
  v = version;

  exludeFromAds = ['conf-advert', 'announcements'];

  constructor(public media: TdMediaService, private router: Router, private dialog: MatDialog) {
  }

  ngOnInit() {
    this.routerSub = this.router.events.filter(event => event instanceof NavigationEnd).subscribe(
      (e: NavigationEnd) => {
        if (!e || (!e.urlAfterRedirects && !e.url)) {
          this.showAd = false;
          return;
        }
        let url = e.urlAfterRedirects || e.url;
        let split = url.split('/');
        let final = split[split.length - 1];
        if (this.exludeFromAds.indexOf(final) > -1) {
          this.showAd = false;
          return;
        }
        this.showAd = true;
      }
    );
  }

  ngOnDestroy() {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  openDevInfo() {
    let dialogRef = this.dialog.open(DevInfoComponent);
  }

}
