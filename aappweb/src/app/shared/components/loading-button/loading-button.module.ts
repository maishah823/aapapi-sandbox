import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LoadingButtonComponent} from './loading-button.component';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {CovalentLoadingModule} from '@covalent/core/loading';

@NgModule({
  imports: [
    CommonModule,
    CovalentLoadingModule,
    MatButtonModule,
    MatIconModule
  ],
  declarations: [LoadingButtonComponent],
  exports: [LoadingButtonComponent]
})
export class LoadingButtonModule {
}
