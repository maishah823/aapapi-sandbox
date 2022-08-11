import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceDisplayComponent } from './invoice-display.component';
import { InvoiceDisplayService } from '@shared/components/invoice-display/invoice-display.service';
import {MatButtonModule} from '@angular/material/button';
import {CovalentLayoutModule} from '@covalent/core/layout';

@NgModule({
  imports: [
    CommonModule,
    CovalentLayoutModule,
    MatButtonModule
  ],
  declarations: [InvoiceDisplayComponent],
  exports:[InvoiceDisplayComponent],
  providers:[InvoiceDisplayService]
})
export class InvoiceDisplayModule { }
