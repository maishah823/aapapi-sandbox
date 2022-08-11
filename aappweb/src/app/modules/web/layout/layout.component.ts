import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';
import {UserState} from '@shared/state/user/user.model';
import {Logout} from '@shared/state/user/user.actions';
import {menuFly, shrinkExpand} from '@shared/animations';
import {Subscription} from 'rxjs/Subscription';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {IeComponent} from '../dialogs/ie/ie.component';
import {WindowAgentService} from 'app/main/window-agent.service';
import {MatDialog} from '@angular/material/dialog';
import {TdMediaService} from '@covalent/core/media';
import {JwtHelperService} from '@auth0/angular-jwt';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  animations: [menuFly, shrinkExpand],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutComponent implements OnInit, AfterViewInit {

  //Menu animation control
  @ViewChild('mainLayout') mainLayout: ElementRef | any;
  @ViewChild('loginRef') loginRef;
  menuOpenSub$: Subscription;
  menuCloseSub$: Subscription;
  menuState = 'closed';
  isStandalone = false;

  //Menu Items
  userLinks = [];
  adminLinks = [];
  memberLinks = [];
  conferenceLinks = [];
  aboutLinks = [];
  confLinks = [];
  educatorLinks = [];
  resourcesLinks = [];
  regionalLinks = [];


  user: Observable<UserState>;

  routerSub: Subscription;

  constructor(private devices: WindowAgentService,
              private store: Store<any>, public media: TdMediaService, private jwt: JwtHelperService,
              private title: Title, private router: Router, private activatedRoute: ActivatedRoute,
              private dialog: MatDialog,
              private renderer2: Renderer2) {
    this.user = store.select('user');
  }

  ngOnInit() {

    this.isStandalone = this.devices.isStandAlone();
    this.routerSub = this.router.events
      .filter((event) => event instanceof NavigationEnd)
      .map((e) => {
        this.routerSub = this.router.events.filter(event => event instanceof NavigationEnd).subscribe(
          (e: NavigationEnd) => {
            console.log(e.urlAfterRedirects);
            (window as any).gtag('config', 'UA-129665819-1', {'page_path': e.urlAfterRedirects});
          }
        );
        return this.activatedRoute;
      })
      .map((route) => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      })
      .filter((route) => route.outlet === 'primary')
      .mergeMap((route) => route.data)
      .subscribe((event) => this.title.setTitle((event['title'] ? event['title'] + ' | ' : '') + 'AAPP'));

    this.userLinks = [
      {title: 'Profile', icon: 'account_box', route: 'user'},
      {title: 'Payment/Invoice History', icon: 'payment', route: 'user/payment-history'}
    ];

    this.regionalLinks = [
      {title: 'Application Inbox', icon: 'inbox', route: 'admin/inbox'},
      {title: 'Broadcast', icon: 'mail', route: 'admin/regional-email'},
    ];

    this.adminLinks = [
      //{title:'Overview', icon: 'star', route:'admin'},
      {title: 'Check-In', icon: 'check', route: 'admin/check-in'},
      {title: 'Posts', icon: 'assignment', route: 'admin/posts'},
      {title: 'Applications', icon: 'description', route: 'admin/applications'},
      //{title:'Members', icon: 'start', route:'admin/members'},
      {title: 'Bulk Email', icon: 'mail', route: 'admin/email'},
      {title: 'Users', icon: 'face', route: 'admin/users'},
      {title: 'Seminar', icon: 'event_seat', route: 'admin/conference'},
      {title: 'Financial', icon: 'attach_money', route: 'admin/financial'},
      {title: 'Data Export', icon: 'table_chart', route: 'admin/reports'},
      {title: 'Schools', icon: 'business', route: 'admin/schools'},
      {title: 'System', icon: 'computer', route: 'admin/system'}

    ];

    this.educatorLinks = [
      {title: 'Student Discounts', icon: 'school', route: 'school'},

    ];

    this.confLinks = [
      {title: 'Seminar News', icon: 'rss_feed', route: 'conf/news'},
      {title: 'My Schedule', icon: 'star', route: 'conf/custom-schedule'},
      {title: 'Master Schedule', icon: 'schedule', route: 'conf/schedule'},
      {title: 'Instructors', icon: 'assignment_ind', route: 'conf/instructors'},
      // { title: 'Classroom', icon: 'schedule', route: 'conf/class-schedule' },
      // { title: 'Events', icon: 'event', route: 'conf/events' },
      {title: 'Vendors', icon: 'store', route: 'conf/vendors'},
      // { title: 'Social', icon: 'people', route: 'conf/social' },
      {title: 'Hotel / Info', icon: 'info', route: 'conf/info'},
    ];


    this.memberLinks = [
      {title: 'News', icon: 'rss_feed', route: 'members/news'},
      {title: 'Member Listing', icon: 'supervisor_account', route: 'members/member-listing'},
      // {title:'Training', icon: 'speaker_notes', route:'members/training'},
      {title: 'John Reid Training', icon: 'speaker_notes', route: 'members/reid'},
      {title: 'Voice Stress Info', icon: 'record_voice_over', route: 'members/voice-stress'},
      {title: 'Bylaws & Constitution', icon: 'cloud_download', route: 'members/bylaws'},
      {title: 'Journal Archive', icon: 'collections', route: 'members/journals'},
      // {title:'Member Gallery', icon: 'photo_album', route:'members/photos'}
    ];

    this.aboutLinks = [
      {title: 'AAPP News', icon: 'star', route: 'public/announcements'},
      {title: 'President\'s Message', icon: 'star', route: 'public/president-message'},
      {title: 'Membership Levels', icon: 'star', route: 'public/levels'},
      {title: 'Officers & Board Members', icon: 'star', route: 'public/officers'},
      {title: 'Past Presidents', icon: 'star', route: 'public/past-presidents'},
      {title: 'Standards & Principals', icon: 'star', route: 'public/standards'},
      {title: 'Certifications', icon: 'star', route: 'public/certifications'},
      {title: 'Chaplain\'s Page', icon: 'star', route: 'public/chaplain'},
      {title: 'Position on Voice Stress', icon: 'star', route: 'public/voice-stress'},
      {title: 'AAPP Scholarship', icon: 'star', route: 'public/scholarship'},
      {title: 'AAPP Awards', icon: 'star', route: 'public/awards'}
    ];

    this.resourcesLinks = [
      {title: 'Polygraph Schools', icon: 'school', route: 'public/school-listing'},
      //{title:'Hire an Examiner', icon: 'contact_phone', route:'public/hire-examiner'},
    ];


    //Notify about incompatible browser:
    let ua = window.navigator.userAgent;
    console.log(ua);
    let msie = ua.indexOf('MSIE');
    let trident = ua.indexOf('Trident/');
    if (msie > 0 || trident > 0) {
      this.dialog.open(IeComponent);
    }


  }

  ngOnDestroy() {
    if (this.menuOpenSub$) {
      this.menuOpenSub$.unsubscribe();
    }
    if (this.menuCloseSub$) {
      this.menuCloseSub$.unsubscribe();
    }
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  ngAfterViewInit() {
    this.user.take(1).subscribe((u: UserState) => {
      if (this.activatedRoute.snapshot.queryParams.login && !u.isLoggedIn) {
        setTimeout(() => {
          this.loginRef.autoOpen();
        }, 10);
      }
    });

    this.menuOpenSub$ = this.mainLayout.sidenav.openedStart.subscribe(() => {
      this.menuState = 'opened';
    });

    this.menuCloseSub$ = this.mainLayout.sidenav.closedStart.subscribe(() => {
      this.menuState = 'closed';
    });

  }

  update() {
    window.location.reload();
  }


  logout() {
    this.store.dispatch(new Logout());
  }

  @HostListener('keyup')
  onKey() {
    return true;
  }

  expires(token) {
    if (token) {
      return this.jwt.getTokenExpirationDate(token);
    } else {
      return null;
    }
  }

}
