import {Routes} from '@angular/router';
import {HomeComponent} from './home/home.component';

export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'web', loadChildren: () => import('../modules/web/web.module').then(m => m.WebModule), data: {preload: true}},
  {path: 'conference', redirectTo: 'web/conf-advert', pathMatch: 'full'},
  {path: 'pay', redirectTo: 'web/public/pay', pathMatch: 'full'},
  {path: '**', redirectTo: ''}
];
