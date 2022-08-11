import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import {LayoutComponent} from './layout/layout.component';
import {AdministratorsComponent} from './administrators/administrators.component';
import {SchoolService} from './school.service';
import {SharedUiModule} from '@shared/shared-ui/shared-ui.module';
import {StatsComponent} from './stats/stats.component';
import {SchoolsDropdownResolverService} from '../../resolvers/schools-dropdown-resolver.service';
import {StudentsComponent} from './students/students.component';
import {EditableModule} from '@shared/editable/editable.module';
import {SchoolsAdminComponent} from '@admin/modules/school/schools-admin/schools-admin.component';
import {CovalentLayoutModule} from '@covalent/core/layout';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatCardModule} from '@angular/material/card';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatSelectModule} from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';

const routes: Routes = [
  {
    path: '', component: LayoutComponent, children: [
      {path: 'school-admin', component: SchoolsAdminComponent, data: {title: 'Admin Schools'}},
      {
        path: 'administrators',
        component: AdministratorsComponent,
        resolve: {schools: SchoolsDropdownResolverService},
        data: {title: 'School Directors'}
      },
      {path: 'students', component: StudentsComponent, resolve: {schools: SchoolsDropdownResolverService}, data: {title: 'Admin Students'}},
      {path: 'stats', component: StatsComponent, data: {title: 'School Stats'}},
      {path: '**', redirectTo: 'school-admin'}
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    SharedUiModule,
    CovalentLayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatPaginatorModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    EditableModule
  ],
  providers: [SchoolService],
  declarations: [LayoutComponent, SchoolsAdminComponent, AdministratorsComponent, StatsComponent, StudentsComponent]
})
export class SchoolModule {
}
