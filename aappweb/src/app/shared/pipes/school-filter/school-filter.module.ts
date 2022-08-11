import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchoolFilterPipe } from './school-filter.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [SchoolFilterPipe],
  exports:[SchoolFilterPipe]
})
export class SchoolFilterModule { }
