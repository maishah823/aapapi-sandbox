import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PasswordChangeComponent} from './password-change.component';
import {ReactiveFormsModule} from '@angular/forms';
import {CovalentLayoutModule} from '@covalent/core/layout';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        CovalentLayoutModule
    ],
    declarations: [PasswordChangeComponent],
    exports: [PasswordChangeComponent]
})
export class PasswordChangeModule {
}
