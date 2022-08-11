import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { uiReducer } from './ui.reducer';


@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('ui',uiReducer)
  ]
})
export class UiStoreModule { }
