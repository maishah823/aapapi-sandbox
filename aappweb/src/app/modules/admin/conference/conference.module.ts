import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {LayoutComponent} from './layout/layout.component';
import {Routes, RouterModule} from '@angular/router';
import {TopicsComponent} from './topics/topics.component';
import {OverviewComponent} from './overview/overview.component';
import {SharedUiModule} from '@shared/shared-ui/shared-ui.module';
import {InstructorsComponent} from './instructors/instructors.component';
import {AttendeesComponent} from './attendees/attendees.component';
import {SchedulingComponent} from './scheduling/scheduling.component';
import {InstructorModule} from '@shared/components/instructor/instructor.module';
import {ScheduleAddModule} from '@shared/components/schedule-add/schedule-add.module';
import {EventAddModule} from '@shared/components/event-add/event-add.module';
import {EventLineModule} from '@shared/components/event-line/event-line.module';
import {EventLineSortModule} from '@shared/pipes/event-line-sort/event-line-sort.module';
import {ExtraEventsComponent} from './events/events.component';
import {CouponsComponent} from './coupons/coupons.component';
import {AddCouponDialogComponent} from './coupons/dialogs/add-coupon-dialog/add-coupon-dialog.component';
import {GuestListComponent} from './guest-list/guest-list.component';
import {InvoiceDisplayModule} from '@shared/components/invoice-display';
import {RejectionReasonModule} from '@shared/components/rejection-reason/rejection-reason.module';
import {VendorsComponent} from './vendors/vendors.component';
import {RatingsComponent} from './ratings/ratings.component';
import {StarRatingModule} from 'angular-star-rating';
import {RsvpComponent} from './rsvp/rsvp.component';
import {UserMatchComponent} from './attendees/modals/user-match/user-match.component';
import {SmsComponent} from './sms/sms.component';
import {HoursLogsComponent} from './hours-logs/hours-logs.component';
import {CommentsDialogComponent} from './comments-dialog/comments-dialog.component';
import {DevToolsComponent} from './dev-tools/dev-tools.component';
import {ConferencesDropdownResolverService} from '@admin/resolvers/conferences-dropdown-resolver.service';
import {CovalentDialogsModule} from '@covalent/core/dialogs';
import {CovalentExpansionPanelModule} from '@covalent/core/expansion-panel';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatChipsModule} from '@angular/material/chips';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatMenuModule} from '@angular/material/menu';
import {MatRadioModule} from '@angular/material/radio';
import {MatDialogModule} from '@angular/material/dialog';

const routes: Routes = [
  {
    path: '', component: LayoutComponent, children: [
      {path: 'overview', component: OverviewComponent, data: {title: 'Admin Conf Overview'}},
      {path: 'topics', component: TopicsComponent, data: {title: 'Admin Conf Topics'}},
      {path: 'instructors', component: InstructorsComponent, data: {title: 'Admin Instructors'}},
      {path: 'attendees', component: AttendeesComponent, data: {title: 'Admin Attendees'}},
      {path: 'vendors', component: VendorsComponent, data: {title: 'Admin Vendors'}},
      {path: 'scheduling', component: SchedulingComponent, data: {title: 'Admin Classroom'}},
      {path: 'events', component: ExtraEventsComponent, data: {title: 'Admin Events'}},
      {path: 'guestlist', component: GuestListComponent, data: {title: 'Guest List'}},
      {path: 'coupons', component: CouponsComponent, data: {title: 'Admin Coupons'}},
      {
        path: 'ratings',
        component: RatingsComponent,
        data: {title: 'Class Ratings'},
        resolve: {conferences: ConferencesDropdownResolverService}
      },
      {
        path: 'hourslogs',
        component: HoursLogsComponent,
        data: {title: 'Hours Logs'},
        resolve: {conferences: ConferencesDropdownResolverService}
      },
      {path: 'rsvp', component: RsvpComponent, data: {title: 'Event RSVPs'}},
      {path: 'sms', component: SmsComponent, data: {title: 'Bulk SMS'}},
      {path: 'developer', component: DevToolsComponent, data: {title: 'Dev Tools'}},
      {path: '**', redirectTo: 'overview'}
    ]
  },
  {path: '**', redirectTo: ''}
];

@NgModule({
    imports: [
        CommonModule,
        CovalentDialogsModule,
        CovalentExpansionPanelModule,
        InstructorModule,
        RouterModule.forChild(routes),
        ReactiveFormsModule,
        SharedUiModule,
        ScheduleAddModule,
        EventAddModule,
        EventLineModule,
        EventLineSortModule,
        MatToolbarModule,
        MatInputModule,
        MatFormFieldModule,
        MatPaginatorModule,
        MatExpansionModule,
        MatChipsModule,
        MatCheckboxModule,
        MatMenuModule,
        MatRadioModule,
        InvoiceDisplayModule,
        RejectionReasonModule,
        MatDialogModule,
        StarRatingModule.forChild()
    ],
    declarations: [LayoutComponent, TopicsComponent, OverviewComponent,
        InstructorsComponent, AttendeesComponent, SchedulingComponent, ExtraEventsComponent,
        CouponsComponent, AddCouponDialogComponent, GuestListComponent, VendorsComponent, RatingsComponent,
        RsvpComponent, UserMatchComponent, SmsComponent, HoursLogsComponent, CommentsDialogComponent, DevToolsComponent]
})
export class ConferenceModule {
}
