import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CheckInComponent} from './check-in/check-in.component';
import {Routes, RouterModule} from '@angular/router';
import {ConfirmPhoneDialogComponent} from './confirm-phone-dialog/confirm-phone-dialog.component';
import {ReactiveFormsModule} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {MatDialogModule} from '@angular/material/dialog';
import {MatRadioModule} from '@angular/material/radio';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatButtonModule} from '@angular/material/button';

const routes: Routes = [
  {path: '', component: CheckInComponent, data: {title: 'Check In'}},
  {path: '**', redirectTo: ''}
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatPaginatorModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatDialogModule,
        MatRadioModule
    ],
    declarations: [CheckInComponent, ConfirmPhoneDialogComponent]
})
export class CheckInModule {
}
