import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import {LayoutComponent} from './layout/layout.component';
import {StudentsComponent} from './students/students.component';
import {EducatorService} from './services/educator.service';
import {SharedUiModule} from '@shared/shared-ui/shared-ui.module';
import {EditableModule} from '@shared/editable/editable.module';

import {AddStudentDialogComponent} from './add-student-dialog/add-student-dialog.component';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatIconModule} from '@angular/material/icon';
import {MatDialogModule} from '@angular/material/dialog';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';

const routes: Routes = [
  {
    path: '', component: LayoutComponent, children: [
      {path: 'students', component: StudentsComponent, data: {title: 'Manage Students'}},
      {path: '**', redirectTo: 'students'}
    ]
  }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        ReactiveFormsModule,
        SharedUiModule,
        MatCardModule,
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        MatPaginatorModule,
        MatIconModule,
        EditableModule,
        MatDialogModule,
        MatDatepickerModule,
        MatNativeDateModule
    ],
    providers: [EducatorService],
    declarations: [LayoutComponent, StudentsComponent, AddStudentDialogComponent]
})
export class SchoolModule {
}
