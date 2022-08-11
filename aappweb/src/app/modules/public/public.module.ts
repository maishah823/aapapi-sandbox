import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {RouterModule, Routes} from '@angular/router';
import {PresidentMessageComponent} from './president-message/president-message.component';
import {SharedUiModule} from '@shared/shared-ui/shared-ui.module';
import {UserStoreModule} from '@shared/state';
import {LoadingButtonModule} from '@shared/components/loading-button/loading-button.module';

// Components
import {LayoutComponent} from './layout/layout.component';
import {JoinComponent} from './join/join.component';
import {JoinGuard} from '../web/guards/join.guard';
import {AttendGuard} from '../web/guards/attend.guard';
import {SchoolListingComponent} from './school-listing/school-listing.component';
import {ScrollToModule} from '@nicky-lenaers/ngx-scroll-to';

import {PublicService} from './services/public.service';
import {SchoolsResolverService} from '@public/services/schools.resolver';
import {PayComponent} from './pay/pay.component';
import {OfficersComponent} from './officers/officers.component';
import {PastPresidentsComponent} from './past-presidents/past-presidents.component';
import {StandardsComponent} from './standards/standards.component';
import {ChaplainComponent} from './chaplain/chaplain.component';
import {VoiceStressComponent} from './voice-stress/voice-stress.component';
import {ScholarshipComponent} from './scholarship/scholarship.component';
import {AwardsComponent} from '@public/awards/awards.component';
import {HireExaminerComponent} from './hire-examiner/hire-examiner.component';
import {AnnouncementsComponent} from './announcements/announcements.component';
import {ForgotComponent} from './forgot/forgot.component';
import {ResetComponent} from './reset/reset.component';
import {BlogDetailModule} from '@shared/components/blog-detail';
import {BlogPostComponent} from './blog-post/blog-post.component';
import {SchoolFilterModule} from '@shared/pipes/school-filter/school-filter.module';
import {FroalaViewModule} from 'angular-froala-wysiwyg';
import {LevelsComponent} from './levels/levels.component';
import {CertificationsComponent} from './certifications/certifications.component';
import {CovalentStepsModule} from '@covalent/core/steps';
import {CovalentDialogsModule} from '@covalent/core/dialogs';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatPaginatorModule} from '@angular/material/paginator';

const routes: Routes = [
  {
    path: '', component: LayoutComponent, children: [
      {path: 'president-message', component: PresidentMessageComponent, data: {animation: 'president', title: 'Message from President'}},
      {path: 'levels', component: LevelsComponent, data: {animation: 'levels', title: 'Membership Levels'}},
      {path: 'school-listing', component: SchoolListingComponent, data: {animation: 'schools-listing', title: 'Approved Schools'}},
      {path: 'pay', component: PayComponent, data: {animation: 'pay-invoices', title: 'Pay Invoices'}},
      {path: 'pay/:invoice', component: PayComponent, data: {animation: 'pay-invoices', title: 'Pay Invoices'}},
      {
        path: 'join',
        component: JoinComponent,
        canActivate: [JoinGuard],
        resolve: {schools: SchoolsResolverService},
        data: {animation: 'join-aapp', title: 'Apply for Membership'}
      },
      {
        path: 'attend',
        loadChildren: () => import('./attend/attend.module').then(m => m.AttendModule),
        canActivate: [AttendGuard],
        data: {animation: 'attend-conf', title: 'Conference Registration'}
      },
      {path: 'officers', component: OfficersComponent, data: {title: 'Officers & Board Members'}},
      {path: 'standards', component: StandardsComponent, data: {title: 'Standards & Principals'}},
      {path: 'past-presidents', component: PastPresidentsComponent, data: {title: 'Past Presidents'}},
      {path: 'chaplain', component: ChaplainComponent, data: {title: 'Chaplain'}},
      {path: 'voice-stress', component: VoiceStressComponent, data: {title: 'Voice-Stress'}},
      {path: 'scholarship', component: ScholarshipComponent, data: {title: 'Scholarships'}},
      {path: 'awards', component: AwardsComponent, data: {title: 'Awards'}},
      {path: 'certifications', component: CertificationsComponent, data: {title: 'Certifications'}},
      {path: 'hire-examiner', component: HireExaminerComponent, data: {title: 'Hire an Examiner'}},
      {path: 'announcements', component: AnnouncementsComponent, data: {title: 'News'}},
      {path: 'forgot', component: ForgotComponent, data: {title: 'Forgot Password'}},
      {path: 'reset/:code', component: ResetComponent, data: {title: 'Reset Password'}},
      {path: 'post/:id', component: BlogPostComponent, data: {title: 'News'}},
      {path: '**', redirectTo: 'announcements'}
    ]
  }
];


@NgModule({
  declarations: [
    LayoutComponent,
    PresidentMessageComponent,
    JoinComponent,
    SchoolListingComponent,
    PayComponent,
    OfficersComponent,
    PastPresidentsComponent,
    StandardsComponent,
    ChaplainComponent,
    VoiceStressComponent,
    ScholarshipComponent,
    AwardsComponent,
    HireExaminerComponent,
    AnnouncementsComponent,
    ForgotComponent,
    ResetComponent,
    BlogPostComponent,
    LevelsComponent,
    CertificationsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedUiModule,
    UserStoreModule,
    RouterModule.forChild(routes),
    CovalentStepsModule,
    CovalentDialogsModule,
    ScrollToModule.forRoot(),
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatRadioModule,
    MatTooltipModule,
    MatProgressBarModule,
    LoadingButtonModule,
    MatPaginatorModule,
    BlogDetailModule,
    SchoolFilterModule,
    FroalaViewModule
  ],
  providers: [PublicService, SchoolsResolverService]
})
export class PublicModule {
}
