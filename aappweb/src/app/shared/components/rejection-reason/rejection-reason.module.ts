import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RejectionReasonComponent} from './rejection-reason.component';
import {ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
    ],
    declarations: [RejectionReasonComponent],
    exports: [RejectionReasonComponent]
})
export class RejectionReasonModule {
}
