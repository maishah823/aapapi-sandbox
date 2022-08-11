import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import {LayoutComponent} from './layout/layout.component';
import {ScheduleComponent} from './schedule/schedule.component';
import {ChatModule} from './chat';
import {SocialComponent} from './social/social.component';
import {ConfServiceService} from './services/conf-service.service';
import {EventLineSortModule} from '@shared/pipes/event-line-sort/event-line-sort.module';
import {EventLineModule} from '@shared/components/event-line/event-line.module';
import {StarRatingModule} from 'angular-star-rating';
import {EventsComponent} from './events/events.component';
import {NewsComponent} from './news/news.component';
import {ClassDetailComponent} from './class-detail/class-detail.component';
import {BlogDetailModule} from '@shared/components/blog-detail';
import {VendorsComponent} from './vendors/vendors.component';
import {InfoComponent} from './info/info.component';
import {BluesheetComponent} from './bluesheet/bluesheet.component';
import {CheckoutGuard} from '../web/guards/checkout.guard';
import {MasterComponent} from './master/master.component';
import {CustomScheduleComponent} from './custom-schedule/custom-schedule.component';
import {ConfStartComponent} from './conf-start/conf-start.component';
import {EditableModule} from '@shared/editable/editable.module';
import {CapPipe} from '@shared/pipes/cap.pipe';
import {SharedUiModule} from '@shared/shared-ui/shared-ui.module';
import {InstructorsComponent} from './instructors/instructors.component';
import {MatListModule} from '@angular/material/list';
import {CovalentLayoutModule} from '@covalent/core/layout';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {CovalentDialogsModule} from '@covalent/core/dialogs';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

const routes: Routes = [
  {
    path: '', component: LayoutComponent, children: [
      {path: 'news', component: NewsComponent, data: {title: 'Conf News'}},
      {path: 'conf-start', component: ConfStartComponent, data: {title: 'AAPP Seminar Quicklinks'}},
      {path: 'custom-schedule', component: CustomScheduleComponent, data: {title: 'My Schedule'}},
      {path: 'schedule', component: MasterComponent, data: {title: 'Conf Master Schedule'}},
      {path: 'instructors', component: InstructorsComponent, data: {title: 'Instructors'}},
      {path: 'class-schedule', component: ScheduleComponent, data: {title: 'Conf Class Schedule'}},
      {path: 'events', component: EventsComponent, data: {title: 'Conf Events'}},
      {path: 'vendors', component: VendorsComponent, data: {title: 'Conf Vendors'}},
      {path: 'social', component: SocialComponent, data: {title: 'Conf Chat'}},
      {path: 'info', component: InfoComponent, data: {title: 'Conf Info'}},
      {path: 'checkout', component: BluesheetComponent, canActivate: [CheckoutGuard], data: {title: 'Conf Checkout / Bluesheet'}},
      {path: 'schedule/:id', component: ClassDetailComponent, data: {title: 'Class Viewer'}},
      {path: '**', redirectTo: 'news'}
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    SharedUiModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    EventLineSortModule,
    EventLineModule,
    ChatModule,
    MatListModule,
    CovalentLayoutModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatPaginatorModule,
    BlogDetailModule,
    MatInputModule,
    MatFormFieldModule,
    CovalentDialogsModule,
    MatProgressSpinnerModule,
    EditableModule,
    StarRatingModule.forChild()
  ],
  declarations: [LayoutComponent, ScheduleComponent, SocialComponent,
    EventsComponent, NewsComponent, ClassDetailComponent, VendorsComponent, InfoComponent,
    BluesheetComponent, MasterComponent, CustomScheduleComponent, ConfStartComponent, InstructorsComponent],
  providers: [ConfServiceService, CheckoutGuard]
})
export class ConfModule {
  constructor() {
  }
}
