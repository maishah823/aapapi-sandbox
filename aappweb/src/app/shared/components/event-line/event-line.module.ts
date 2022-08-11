import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventLineComponent } from './event-line.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [EventLineComponent],
  exports:[EventLineComponent]
})
export class EventLineModule { }
