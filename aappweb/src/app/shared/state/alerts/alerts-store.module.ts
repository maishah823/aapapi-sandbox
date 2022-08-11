import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule} from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { alertsReducer } from './alerts.reducer';
import { AlertsState } from './alerts.model';
import { AlertEffects } from './alerts.effects';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('alerts',alertsReducer),
    EffectsModule.forFeature([AlertEffects])
  ]
})
export class AlertsStoreModule { }