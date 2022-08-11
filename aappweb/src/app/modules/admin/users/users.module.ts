import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LayoutComponent} from './layout/layout.component';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';
import {UserListComponent} from './user-list/user-list.component';
import {SharedUiModule} from '@shared/shared-ui/shared-ui.module';
import {PasswordChangeModule} from '@shared/components/password-change/password-change.module';
import {LevelModule} from '@shared/components/level/level.module';
import {InvoiceDialogComponent} from './invoice-dialog/invoice-dialog.component';
import {CovalentExpansionPanelModule} from '@covalent/core/expansion-panel';
import {CovalentLayoutModule} from '@covalent/core/layout';
import {CovalentDialogsModule} from '@covalent/core/dialogs';
import {MatIconModule} from '@angular/material/icon';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatListModule} from '@angular/material/list';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSelectModule} from '@angular/material/select';

const routes: Routes = [
  {
    path: '', component: LayoutComponent, children: [
      {path: 'list', component: UserListComponent},
      {path: '**', redirectTo: 'list'}
    ]
  }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        SharedUiModule,
        FormsModule,
        ReactiveFormsModule,
        CovalentExpansionPanelModule,
        CovalentLayoutModule,
        CovalentDialogsModule,
        MatIconModule,
        MatCheckboxModule,
        MatListModule,
        MatFormFieldModule,
        MatButtonModule,
        MatCardModule,
        MatInputModule,
        MatPaginatorModule,
        MatSelectModule,
        PasswordChangeModule,
        LevelModule
    ],
    declarations: [LayoutComponent, UserListComponent, InvoiceDialogComponent]
})
export class UsersModule {
}
