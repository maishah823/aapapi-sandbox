import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {SharedUiModule} from '@shared/shared-ui/shared-ui.module';
import {EditEmailComponent} from './dialogs/edit-email/edit-email.component';
import {EditDateComponent} from './dialogs/edit-date/edit-date.component';
import {EditTextComponent} from './dialogs/edit-text/edit-text.component';
import {EditPhoneComponent} from './dialogs/edit-phone/edit-phone.component';
import {EditableService} from './editable.service';
import {EditAddressComponent} from './dialogs/edit-address/edit-address.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        SharedUiModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatDatepickerModule,
        MatNativeDateModule
    ],
    declarations: [EditEmailComponent, EditDateComponent, EditTextComponent, EditPhoneComponent, EditAddressComponent],
    providers: [EditableService]
})
export class EditableModule {
}
