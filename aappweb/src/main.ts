import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/main/app.module';
import { environment } from './environments/environment';
import 'hammerjs';

if (environment.production) {
  enableProdMode();
  // console.log = () => { };
  // console.error = () => { };
}

platformBrowserDynamic().bootstrapModule(AppModule)
.then(function(){
  if ('serviceWorker' in navigator && environment.production) {
    navigator.serviceWorker.register('ngsw-worker.js');
  }
})
  .catch(err => console.error(err));
