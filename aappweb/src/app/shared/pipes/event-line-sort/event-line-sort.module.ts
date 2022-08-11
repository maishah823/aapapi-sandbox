import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventLineSortPipe } from './event-line-sort.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [EventLineSortPipe],
  exports: [EventLineSortPipe]
})
export class EventLineSortModule { }
