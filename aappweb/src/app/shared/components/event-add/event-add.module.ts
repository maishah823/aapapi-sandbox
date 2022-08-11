import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {EventAddDialogComponent} from './dialogs/event-add-dialog/event-add-dialog.component';
import {EventAddComponent} from './event-add.component';
import {EventAddService} from './event-add.service';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {CovalentLayoutModule} from '@covalent/core/layout';
import {SharedUiModule} from '@shared/shared-ui/shared-ui.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatListModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    CovalentLayoutModule,
    SharedUiModule
  ],
    providers: [EventAddService],
    declarations: [EventAddDialogComponent, EventAddComponent],
    exports: [EventAddComponent, EventAddDialogComponent]
})
export class EventAddModule {
}
