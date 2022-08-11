import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { userReducer } from './user.reducer';
import { UserEffects } from '@shared/state/user/user.effects';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('user',userReducer),
    EffectsModule.forFeature([UserEffects])  
  ],
  providers:[]
})
export class UserStoreModule { }
