import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReportsComponent} from './reports/reports.component';
import {RouterModule, Routes} from '@angular/router';
import {SharedUiModule} from '@shared/shared-ui/shared-ui.module';
import {ReportsService} from './services/reports.service';
import {MatPaginatorModule} from '@angular/material/paginator';

const routes: Routes = [
  {path: '', component: ReportsComponent},
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [
    SharedUiModule,
    CommonModule,
    MatPaginatorModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ReportsComponent],
  providers: [ReportsService]
})
export class ReportsModule {
}
