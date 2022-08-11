import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DevInfoComponent } from './dev-info.component';


@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [DevInfoComponent],
    exports: [DevInfoComponent]
})
export class DevInfoModule { }
