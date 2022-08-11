import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LayoutComponent} from './layout/layout.component';
import {Routes, RouterModule} from '@angular/router';

let routes: Routes = [
  {
    path: '', component: LayoutComponent, children: []
  },
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  declarations: [LayoutComponent]
})
export class MembersModule {
}
