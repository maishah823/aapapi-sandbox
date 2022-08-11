import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { formsReducer } from './forms.reducer';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('forms',formsReducer)
  ]
})
export class FormsStoreModule { }
