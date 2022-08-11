import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LayoutComponent} from './layout/layout.component';
import {OverviewComponent} from './overview/overview.component';
import {Routes, RouterModule} from '@angular/router';
import {SharedUiModule} from '@shared/shared-ui/shared-ui.module';
import {LogsComponent} from '@admin/system/logs/logs.component';
import {ReactiveFormsModule} from '@angular/forms';

import {VersionsComponent} from './versions/versions.component';
import {ManualMemberComponent} from './manual-member/manual-member.component';
import {DeveloperGuard} from 'app/modules/web/guards/developer.guard';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatCheckboxModule} from '@angular/material/checkbox';

const routes: Routes = [
  {
    path: '', component: LayoutComponent, children: [
      {path: 'overview', component: OverviewComponent, data: {title: 'System Stats'}},
      {path: 'versions', component: VersionsComponent, data: {title: 'Version History'}},
      {path: 'manualmember', component: ManualMemberComponent, data: {title: 'Manual Member Add'}, canActivate: [DeveloperGuard]},
      {path: 'logs', component: LogsComponent, data: {title: 'System Logs'}},
      {path: '**', redirectTo: 'overview'}
    ]
  },
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedUiModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatCheckboxModule
  ],
  declarations: [LayoutComponent, OverviewComponent, LogsComponent, VersionsComponent, ManualMemberComponent]
})
export class SystemModule {
}
