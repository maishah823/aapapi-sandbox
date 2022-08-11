import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileDropDirective } from './file-drop.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [FileDropDirective],
  exports:[FileDropDirective]
})
export class FileDropModule { }
