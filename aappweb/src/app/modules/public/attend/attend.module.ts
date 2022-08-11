import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {IndividualComponent} from './individual/individual.component';
import {AgencyComponent} from './agency/agency.component';
import {VendorComponent} from './vendor/vendor.component';
import {AttendComponent} from '@public/attend/attend.component';
import {ProgressDialogComponent} from './progress-dialog/progress-dialog.component';
import {SharedUiModule} from '@shared/shared-ui/shared-ui.module';
import {ReactiveFormsModule} from '@angular/forms';
import {AttendService} from './attend.service';
import {MatListModule} from '@angular/material/list';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatRadioModule} from '@angular/material/radio';
import {CovalentDialogsModule} from '@covalent/core/dialogs';
import {MatDialogModule} from '@angular/material/dialog';
import {MatProgressBarModule} from '@angular/material/progress-bar';


let routes: Routes = [
  {
    path: '', component: AttendComponent, children: [
      {path: 'individual', component: IndividualComponent},
      {path: 'agency', component: AgencyComponent},
      {path: 'vendor', component: VendorComponent}
    ]
  }
];

@NgModule({
    imports: [
        CommonModule,
        SharedUiModule,
        RouterModule.forChild(routes),
        ReactiveFormsModule,
        MatListModule,
        MatSelectModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        MatTooltipModule,
        MatRadioModule,
        CovalentDialogsModule,
        MatDialogModule,
        MatProgressBarModule
    ],
    providers: [AttendService],
    declarations: [IndividualComponent, AgencyComponent, VendorComponent, AttendComponent, ProgressDialogComponent]
})
export class AttendModule {
}
