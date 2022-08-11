import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import {AlertsStoreModule, FormsStoreModule, UiStoreModule, UserStoreModule} from '@shared/state';
import {LayoutComponent} from './layout/layout.component';
import {LoginComponent} from '@shared/components/login/login.component';
import {AlertComponent} from '@shared/components/alert/alert.component';
import {ConfAdvertComponent} from './conf-advert/conf-advert.component';
import {StarRatingModule} from 'angular-star-rating';
import {DevInfoModule} from '@shared/components/dev-info/dev-info.module';
import {FroalaEditorModule, FroalaViewModule} from 'angular-froala-wysiwyg';

//Services
import {AppPreloaderService, SocketService, UserService} from '@shared/services';
import {AuthGuard} from 'app/modules/web/guards/auth.guard';
import {AdminGuard} from 'app/modules/web/guards/admin.guard';
import {MemberGuard} from 'app/modules/web/guards/member.guard';
import {ConfGuard} from 'app/modules/web/guards/conf.guard';
import {JoinGuard} from './guards/join.guard';
import {SchoolGuard} from './guards/school.guard';
// Observable operators and class extensions
import '../../../rxjs-imports';

//Directives
import {LoginPopoverDirective} from '@shared/directives/login-popover.directive';
import {StartComponent} from './start/start.component';

import {WebService} from './web.service';
import {RequiredInfoGuard} from './guards/requiredInfo.guard';
import {AttendGuard} from './guards/attend.guard';
import {JoinAdvertComponent} from './join-advert/join-advert.component';
import {TokenMonitorService} from '@shared/services/token-monitor.service';
import {DeveloperGuard} from './guards/developer.guard';
import {IeComponent} from './dialogs/ie/ie.component';
import {WindowAgentService} from 'app/main/window-agent.service';
import {CovalentLayoutModule} from '@covalent/core/layout';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatDialogModule} from '@angular/material/dialog';
import {TdMediaService} from '@covalent/core/media';
import {JwtHelperService, JwtModule} from '@auth0/angular-jwt';

//Routes
const routes: Routes = [
  {
    path: '', component: LayoutComponent, children: [
      {path: 'public', loadChildren: () => import('../public/public.module').then(m => m.PublicModule), data: {preload: true}},
      {
        path: 'admin',
        loadChildren: () => import('../admin/admin.module').then(m => m.AdminModule),
        canLoad: [AdminGuard, RequiredInfoGuard]
      },
      {
        path: 'members',
        loadChildren: () => import('../members/members.module').then(m => m.MembersModule),
        canLoad: [MemberGuard, RequiredInfoGuard]
      },
      {path: 'conf', loadChildren: () => import('../conf/conf.module').then(m => m.ConfModule), canLoad: [ConfGuard, RequiredInfoGuard]},
      {
        path: 'school',
        loadChildren: () => import('../school/school.module').then(m => m.SchoolModule),
        canLoad: [SchoolGuard, RequiredInfoGuard]
      },
      {path: 'start', component: StartComponent, canActivate: [AuthGuard, RequiredInfoGuard], data: {title: 'Quick Start'}},
      {path: 'join-advert', component: JoinAdvertComponent, canActivate: [JoinGuard], data: {title: 'Membership'}},
      {path: 'conf-advert', component: ConfAdvertComponent, canActivate: [AttendGuard], data: {title: 'Seminar'}},
      {
        path: 'user', loadChildren: () => import('../user-profile/user-profile.module')
          .then(m => m.UserProfileModule), canLoad: [AuthGuard], pathMatch: "full"
      },
      {path: '**', redirectTo: 'public'}
    ]
  },
  {path: '**', redirectTo: ''}
];

@NgModule({
  declarations: [
    LayoutComponent,
    LoginPopoverDirective,
    LoginComponent,
    AlertComponent,
    StartComponent,
    ConfAdvertComponent,
    JoinAdvertComponent,
    IeComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CovalentLayoutModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatToolbarModule,
    MatInputModule,
    MatDialogModule,
    RouterModule.forChild(routes),
    FormsStoreModule,
    UserStoreModule,
    AlertsStoreModule,
    UiStoreModule,
    StarRatingModule.forRoot(),
   // JwtModule.forRoot(),
    DevInfoModule,
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot()
  ],
  providers: [
    UserService,
    AppPreloaderService,
    TdMediaService,
    SocketService,
    AuthGuard,
    AdminGuard,
    MemberGuard,
    DeveloperGuard,
    JoinGuard,
    ConfGuard,
    AttendGuard,
    SchoolGuard,
    RequiredInfoGuard,
    WebService,
    JwtHelperService,
    TokenMonitorService,
    WindowAgentService
  ]
})
export class WebModule {
  constructor(private tokenMonitor: TokenMonitorService) {
  }
}
