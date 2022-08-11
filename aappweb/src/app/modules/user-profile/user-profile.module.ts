import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProfileComponent} from './profile/profile.component';
import {Routes, RouterModule} from '@angular/router';
import {UpgradeMembershipComponent} from './upgrade-membership/upgrade-membership.component';
import {PaymentHistoryComponent} from './payment-history/payment-history.component';
import {SharedUiModule} from '@shared/shared-ui/shared-ui.module';
import {EditableModule} from '@shared/editable/editable.module';
import {InvoiceDisplayModule} from '@shared/components/invoice-display/invoice-display.module';
import {PasswordChangeModule} from '@shared/components/password-change/password-change.module';
import {ReactiveFormsModule} from '@angular/forms';
import {InstructorModule} from '@shared/components/instructor/instructor.module';
import {PhotoResizeService} from '@shared/services/photo-resize.service';

import {UserService} from './services/user.service';
import {ConfInfoComponent} from './conf-info/conf-info.component';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDialogModule} from '@angular/material/dialog';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';

const routes: Routes = [
  {path: 'profile', component: ProfileComponent, data: {title: 'Profile'}},
  {path: 'upgrade-membership', component: UpgradeMembershipComponent, data: {title: 'Upgrade Membership'}},
  {path: 'payment-history', component: PaymentHistoryComponent, data: {title: 'Payment History'}},
  {path: 'conf-info', component: ConfInfoComponent, data: {title: 'My Conference Info'}},
  {path: '', redirectTo: 'profile', pathMatch: "full"}
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedUiModule,
    EditableModule,
    InvoiceDisplayModule,
    PasswordChangeModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    InstructorModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatRadioModule
  ],
  declarations: [ProfileComponent, UpgradeMembershipComponent, PaymentHistoryComponent, ConfInfoComponent],
  providers: [UserService, PhotoResizeService]
})
export class UserProfileModule {
}
