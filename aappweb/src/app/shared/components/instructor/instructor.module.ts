import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {InstructorComponent} from './instructor.component';
import {ReactiveFormsModule} from '@angular/forms';
import {EditableModule} from '@shared/editable/editable.module';
import {InstructorService} from './instructor.service';
import {FileDropModule} from '@shared/directives/file-drop/file-drop.module';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {CovalentLayoutModule} from '@covalent/core/layout';

@NgModule({
  imports: [
    CommonModule,
    CovalentLayoutModule,
    ReactiveFormsModule,
    MatChipsModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatTooltipModule,
    EditableModule,
    MatButtonModule,
    FileDropModule,
    MatProgressSpinnerModule
  ],
  declarations: [InstructorComponent],
  exports: [InstructorComponent],
  providers: [InstructorService]
})
export class InstructorModule {
}
