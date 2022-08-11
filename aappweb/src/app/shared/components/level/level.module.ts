import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LevelComponent} from './level.component';
import {SharedUiModule} from '@shared/shared-ui/shared-ui.module';
import {ReactiveFormsModule} from '@angular/forms';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';

@NgModule({
    imports: [
        CommonModule,
        SharedUiModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
    ],
    declarations: [LevelComponent],
    exports: [LevelComponent]
})
export class LevelModule {
}
