import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LayoutComponent} from './layout/layout.component';
import {Routes, RouterModule} from '@angular/router';
import {SharedUiModule} from '@shared/shared-ui/shared-ui.module';
import {ReactiveFormsModule} from '@angular/forms';
import {InvoicesComponent} from './invoices/invoices.component';
import {InvoiceDetailComponent} from './invoice-detail/invoice-detail.component';
import {InvoiceDisplayModule} from '@shared/components/invoice-display';
import {StatsComponent} from './stats/stats.component';
import {ConfRevenueComponent} from './conf-revenue/conf-revenue.component';
import {ConferencesDropdownResolverService} from '@admin/resolvers/conferences-dropdown-resolver.service';
import {PaymentComponent} from './dialogs/payment/payment.component';
import {AdjustComponent} from './dialogs/adjust/adjust.component';
import {InvoicesByCustComponent} from './invoices-by-cust/invoices-by-cust.component';
import {RemindersComponent} from './reminders/reminders.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatDialogModule} from '@angular/material/dialog';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {CovalentExpansionPanelModule} from '@covalent/core/expansion-panel';

let routes: Routes = [
  {
    path: '', component: LayoutComponent, children: [
      {path: 'stats', component: StatsComponent, data: {title: 'Financial Stats'}},
      {
        path: 'conf-revenue',
        component: ConfRevenueComponent,
        resolve: {conferences: ConferencesDropdownResolverService},
        data: {title: 'Conf Revenue'}
      },
      {path: 'invoices', component: InvoicesComponent, data: {title: 'Invoices'}},
      {path: 'cust-invoices', component: InvoicesByCustComponent, data: {title: 'Customer Invoices'}},
      {path: 'invoices/:id', component: InvoiceDetailComponent, data: {title: 'Invoice Viewer'}},
      {path: 'reminders', component: RemindersComponent, data: {title: 'Reminders'}},
      {path: '**', redirectTo: 'stats'}
    ]
  },
  {path: '**', redirectTo: ''}
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        ReactiveFormsModule,
        SharedUiModule,
        MatToolbarModule,
        MatPaginatorModule,
        MatExpansionModule,
        InvoiceDisplayModule,
        MatFormFieldModule,
        MatSelectModule,
        MatDialogModule,
        MatCheckboxModule,
        CovalentExpansionPanelModule
    ],
    declarations: [LayoutComponent, InvoicesComponent, InvoiceDetailComponent,
        StatsComponent, ConfRevenueComponent, PaymentComponent, AdjustComponent, InvoicesByCustComponent,
        RemindersComponent]
})
export class FinancialModule {
}
