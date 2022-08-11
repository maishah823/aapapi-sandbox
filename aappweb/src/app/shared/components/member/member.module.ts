import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemberComponent } from './member.component';
import { SharedUiModule } from '../../shared-ui/shared-ui.module';

@NgModule({
  imports: [
    CommonModule,
    SharedUiModule
  ],
  declarations: [MemberComponent],
  exports:[MemberComponent]
})
export class MemberModule { }
