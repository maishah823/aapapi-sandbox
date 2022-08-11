import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ConnectFormDirective} from '../directives/connectForm/connectForm.directive';
import {PhonePipe} from '../pipes/phone.pipe';
import {PercPipe} from '../pipes/perc.pipe';
import {CapPipe} from '../pipes/cap.pipe';
import {RomanPipe} from '../pipes/roman.pipe';
import {AddressComponent} from '../components/address/address.component';
import {ReactiveFormsModule} from '@angular/forms';
import {ConferenceService} from '../services/conference.service';
import {LoadingButtonModule} from '@shared/components/loading-button/loading-button.module';
import {CovalentLayoutModule} from '@covalent/core/layout';
import {MatButtonModule} from '@angular/material/button';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatToolbarModule} from '@angular/material/toolbar';
import {NgxMatDatetimePickerComponent} from '@shared/components/ngx-mat-datetime-picker/ngx-mat-datetime-picker.component';
import {NgxMatDatetimePickerModule, NgxMatNativeDateModule} from '@angular-material-components/datetime-picker';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from "@angular/material/core";

@NgModule({
  imports: [
    CommonModule,
    CovalentLayoutModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    LoadingButtonModule,
    MatToolbarModule,
    NgxMatDatetimePickerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgxMatNativeDateModule
  ],
  exports: [
    CovalentLayoutModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    PhonePipe,
    PercPipe,
    CapPipe,
    RomanPipe,
    ConnectFormDirective,
    AddressComponent,
    LoadingButtonModule,
    MatToolbarModule,
    NgxMatDatetimePickerModule,
    NgxMatDatetimePickerComponent,
    MatNativeDateModule,
    NgxMatNativeDateModule

  ],
  providers: [ConferenceService],
  declarations: [ConnectFormDirective, PhonePipe,
    PercPipe, AddressComponent, CapPipe, RomanPipe,
    NgxMatDatetimePickerComponent
  ]
})
export class SharedUiModule {
}
