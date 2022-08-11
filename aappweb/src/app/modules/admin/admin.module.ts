import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {OverviewComponent} from './overview/overview.component';
import {LayoutComponent} from './layout/layout.component';
import {SharedUiModule} from '../../shared/shared-ui/shared-ui.module';
import {UserStoreModule} from '@shared/state';
import {LoadingButtonModule} from '../../shared/components';
import {SchoolsDropdownResolverService} from './resolvers/schools-dropdown-resolver.service';
import {DropdownService} from './services/dropdown.service';
import {AdminService} from './services/admin.service';
import {ReactiveFormsModule} from '@angular/forms';
import {FileDropModule} from '@shared/directives/file-drop/file-drop.module';
import {StarRatingModule} from 'angular-star-rating';
import {InvoiceDisplayModule} from '@shared/components/invoice-display';
import {ApplicationsComponent} from './applications/applications.component';
import {ApplicationDetailComponent} from './application-detail/application-detail.component';
import {InboxComponent} from './inbox/inbox.component';
import {EmailComponent} from './email/email.component';
import {ConferencesDropdownResolverService} from '@admin/resolvers/conferences-dropdown-resolver.service';
import {PostsComponent} from './posts/posts.component';
import {AddPostComponent} from './add-post/add-post.component';
import {BlogDetailModule} from '@shared/components/blog-detail';
import {PhotoResizeService} from '@shared/services/photo-resize.service';
import {RejectionReasonModule} from '@shared/components/rejection-reason/rejection-reason.module';
import {EditableModule} from '@shared/editable/editable.module';
import {FroalaEditorModule, FroalaViewModule} from 'angular-froala-wysiwyg';
import {EditPostComponent} from './edit-post/edit-post.component';
import {UserDataResolverService} from './resolvers/user-data-resolver.service';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDialogModule} from '@angular/material/dialog';

const routes: Routes = [
  {
    path: '', component: LayoutComponent, children: [
      {path: '', component: OverviewComponent},
      {path: 'schools', loadChildren: ()=> import('./modules/school/school.module').then(m=>m.SchoolModule)},
      {path: 'users', loadChildren: ()=> import('./users/users.module').then(m=>m.UsersModule)},
      {path: 'financial', loadChildren:()=> import('./financial/financial.module').then(m=>m.FinancialModule)},
      {path: 'reports', loadChildren: ()=> import('./reports/reports.module').then(m=>m.ReportsModule)},
      {path: 'members', loadChildren: ()=> import('./members/members.module').then(m=>m.MembersModule)},
      {path: 'conference', loadChildren: ()=> import('./conference/conference.module').then(m=>m.ConferenceModule)},
      {path: 'applications', component: ApplicationsComponent, data: {title: 'Applications'}},
      {path: 'inbox', component: InboxComponent, data: {title: 'Regional Inbox'}},
      {path: 'regional-email', component: EmailComponent, data: {purpose: 'regional', title: 'Regional Email'}},
      {path: 'email', component: EmailComponent, data: {purpose: 'full', title: 'Bulk Email'}},
      {path: 'applications/:id', component: ApplicationDetailComponent, data: {title: 'Application Viewer'}},
      {path: 'posts', component: PostsComponent, data: {title: 'Admin Posts'}},
      {path: 'add-post/:id', component: AddPostComponent, data: {title: 'Edit Post'}},
      {path: 'add-post', component: AddPostComponent, data: {title: 'Add Post'}},
      {path: 'edit-post/:id', component: EditPostComponent, data: {title: 'Edit Post'}, resolve: {user: UserDataResolverService}},
      {path: 'edit-post', component: EditPostComponent, data: {title: 'Add Post'}, resolve: {user: UserDataResolverService}},
      {path: 'system', loadChildren: ()=> import('./system/system.module').then(m=>m.SystemModule)},
      {path: 'check-in', loadChildren: ()=> import('./check-in/check-in.module').then(m=>m.CheckInModule)},
      {path: '**', redirectTo: ''}
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    SharedUiModule,
    UserStoreModule,
    LoadingButtonModule,
    InvoiceDisplayModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatAutocompleteModule,
    BlogDetailModule,
    MatProgressSpinnerModule,
    FileDropModule,
    MatDialogModule,
    RejectionReasonModule,
    StarRatingModule.forChild(),
    EditableModule,
    FroalaEditorModule,
    FroalaViewModule
  ],
  providers: [DropdownService, SchoolsDropdownResolverService, ConferencesDropdownResolverService,
    AdminService, PhotoResizeService, UserDataResolverService],
  declarations: [OverviewComponent, LayoutComponent, ApplicationsComponent, ApplicationDetailComponent,
    InboxComponent, EmailComponent, PostsComponent, AddPostComponent, EditPostComponent]
})
export class AdminModule {
}
