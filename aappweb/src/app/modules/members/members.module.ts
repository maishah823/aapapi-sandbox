import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Routes, RouterModule} from '@angular/router';
import {MemberListingComponent} from './member-listing/member-listing.component';
import {TrainingComponent} from './training/training.component';
import {NewsComponent} from './news/news.component';
import {StressTestComponent} from './stress-test/stress-test.component';
import {ReactiveFormsModule} from '@angular/forms';
import {FileDropModule} from '@shared/directives/file-drop/file-drop.module';
import {ReidComponent} from './reid/reid.component';
import {JournalsComponent} from './journals/journals.component';
import {MembersService} from './members.service';
import {MemberModule} from '@shared/components/member/member.module';
import {SharedUiModule} from '@shared/shared-ui/shared-ui.module';
import {LayoutComponent} from './layout/layout.component';
import {PhotosComponent} from './photos/photos.component';
import {LightboxComponent} from './photos/dialogs/lightbox/lightbox.component';
import {CaptionComponent} from './photos/dialogs/caption/caption.component';
import {BlogDetailModule} from '@shared/components/blog-detail';
import {PhotoResizeService} from '@shared/services/photo-resize.service';
import {BylawsComponent} from '@members/bylaws/bylaws.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatCardModule} from '@angular/material/card';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDialogModule} from '@angular/material/dialog';

let routes: Routes = [
  {
    path: '', component: LayoutComponent, children: [
      {path: 'news', component: NewsComponent, data: {title: 'Member News'}},
      {path: 'member-listing', component: MemberListingComponent, data: {title: 'Member Listing'}},
      {path: 'training', component: TrainingComponent, data: {title: 'Training Opportunities'}},
      {path: 'reid', component: ReidComponent, data: {title: 'Reid Training'}},
      {path: 'voice-stress', component: StressTestComponent, data: {title: 'Voice-Stress'}},
      {path: 'journals', component: JournalsComponent, data: {title: 'Journals'}},
      {path: 'bylaws', component: BylawsComponent, data: {title: 'Bylaws'}},
      // { path: 'photos', component: PhotosComponent,data:{title:'Member Gallery'} },
      {path: '**', redirectTo: 'news'}
    ]
  }
];


@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        SharedUiModule,
        FileDropModule,
        RouterModule.forChild(routes),
        MatCardModule,
        MatPaginatorModule,
        MemberModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        MatDialogModule,
        BlogDetailModule
    ],
    providers: [MembersService, PhotoResizeService],
    declarations: [MemberListingComponent, TrainingComponent, NewsComponent, StressTestComponent, ReidComponent, JournalsComponent, LayoutComponent, PhotosComponent, LightboxComponent, CaptionComponent, BylawsComponent]
})
export class MembersModule {
}
