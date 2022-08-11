import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {ScheduleAddComponent} from './schedule-add.component';
import {ScheduleAddDialogComponent} from './dialogs/schedule-add-dialog.component';
import {ScheduleAddService} from './schedule-add.service';
import {InstructorFilterPipe} from './instructor-filter.pipe';
import {CovalentLayoutModule} from '@covalent/core/layout';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {SharedUiModule} from '@shared/shared-ui/shared-ui.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    CovalentLayoutModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    SharedUiModule
  ],
    providers: [ScheduleAddService],
    declarations: [ScheduleAddComponent, ScheduleAddDialogComponent, InstructorFilterPipe],
    exports: [ScheduleAddComponent, ScheduleAddDialogComponent]
})
export class ScheduleAddModule {
}
